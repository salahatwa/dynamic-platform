import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Parameter Definition Interface
export interface ParameterDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: any;
  description?: string;
  required?: boolean;
  arrayItemType?: 'string' | 'number' | 'object';
  objectProperties?: ParameterDefinition[];
}

@Component({
  selector: 'app-pdf-parameters-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdf-parameters-dialog.component.html',
  styleUrls: ['./pdf-parameters-dialog.component.css']
})
export class PdfParametersDialogComponent {
  @Input() show = false;
  @Input() templateContent = '';
  @Input() templatePages: any[] = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() generatePdf = new EventEmitter<{ [key: string]: any }>();
  @Output() skipParameters = new EventEmitter<void>();

  // Dialog state
  mode = signal<'form' | 'json'>('form');
  detecting = signal(false);
  detectedParameters = signal<ParameterDefinition[]>([]);
  parameterValues = signal<{ [key: string]: any }>({});
  jsonParameters = signal('');
  jsonError = signal('');

  ngOnInit() {
    if (this.show) {
      this.detectParameters();
    }
  }

  ngOnChanges() {
    if (this.show) {
      this.detectParameters();
    }
  }

  // Detect FreeMarker parameters
  detectParameters() {
    this.detecting.set(true);
    
    setTimeout(() => {
      let allContent = this.templateContent || '';
      
      // Add content from all pages
      this.templatePages.forEach(page => {
        if (page.content) {
          allContent += '\n' + page.content;
        }
      });

      const parameterMap = new Map<string, ParameterDefinition>();
      
      // Match ${variable} patterns
      const variableRegex = /\$\{([^}]+)\}/g;
      let match;
      
      while ((match = variableRegex.exec(allContent)) !== null) {
        const fullExpression = match[1].trim();
        const variableName = this.extractVariableName(fullExpression);
        
        if (variableName && !parameterMap.has(variableName)) {
          const paramDef = this.analyzeParameter(variableName, fullExpression, allContent);
          parameterMap.set(variableName, paramDef);
        }
      }

      // Match <#list> patterns for arrays
      const listRegex = /<#list\s+(\w+)\s+as\s+\w+>/g;
      while ((match = listRegex.exec(allContent)) !== null) {
        const arrayName = match[1];
        if (!parameterMap.has(arrayName)) {
          parameterMap.set(arrayName, {
            name: arrayName,
            type: 'array',
            arrayItemType: 'object',
            required: true,
            description: `Array used in list iteration`
          });
        }
      }

      const detected = Array.from(parameterMap.values());
      this.detectedParameters.set(detected);
      
      // Initialize parameter values
      const initialValues: { [key: string]: any } = {};
      detected.forEach(param => {
        initialValues[param.name] = this.getDefaultValue(param);
      });
      this.parameterValues.set(initialValues);
      
      this.detecting.set(false);
    }, 500);
  }

  private extractVariableName(expression: string): string {
    if (!expression.includes('.') && !expression.includes('[')) {
      return expression;
    }
    
    if (expression.includes('.')) {
      return expression.split('.')[0];
    }
    
    if (expression.includes('[')) {
      return expression.split('[')[0];
    }
    
    return expression;
  }

  private analyzeParameter(name: string, expression: string, content: string): ParameterDefinition {
    const param: ParameterDefinition = {
      name: name,
      type: 'string',
      required: true
    };

    // Check if it's used as an object
    const objectRegex = new RegExp(`\\$\\{${name}\\.(\\w+)\\}`, 'g');
    const objectMatches = content.match(objectRegex);
    
    if (objectMatches) {
      param.type = 'object';
      param.objectProperties = [];
      param.description = `Object with properties: ${objectMatches.map(m => m.match(/\.(\w+)/)?.[1]).filter(Boolean).join(', ')}`;
      
      const properties = new Set<string>();
      objectMatches.forEach(match => {
        const propMatch = match.match(/\.(\w+)/);
        if (propMatch) {
          properties.add(propMatch[1]);
        }
      });
      
      properties.forEach(prop => {
        param.objectProperties!.push({
          name: prop,
          type: 'string',
          required: false,
          description: `Property of ${name} object`
        });
      });
    }

    // Check if it's used in a list
    const listRegex = new RegExp(`<#list\\s+${name}\\s+as\\s+\\w+>`, 'g');
    if (listRegex.test(content)) {
      param.type = 'array';
      param.arrayItemType = param.objectProperties ? 'object' : 'string';
      param.description = `Array used in list iteration${param.objectProperties ? ' containing objects' : ''}`;
    }

    // Add helpful descriptions for common parameter names
    if (!param.description) {
      const lowerName = name.toLowerCase();
      if (lowerName.includes('user') || lowerName.includes('person')) {
        param.description = 'User or person information';
      } else if (lowerName.includes('company') || lowerName.includes('organization')) {
        param.description = 'Company or organization data';
      } else if (lowerName.includes('item') || lowerName.includes('product')) {
        param.description = 'Item or product information';
      } else if (lowerName.includes('date') || lowerName.includes('time')) {
        param.description = 'Date or time value';
      } else {
        param.description = `Template variable: ${name}`;
      }
    }

    return param;
  }

  private getDefaultValue(param: ParameterDefinition): any {
    switch (param.type) {
      case 'string': return '';
      case 'number': return 0;
      case 'boolean': return false;
      case 'array':
        return param.arrayItemType === 'object' && param.objectProperties 
          ? [this.createObjectFromProperties(param.objectProperties)]
          : [''];
      case 'object':
        return param.objectProperties ? this.createObjectFromProperties(param.objectProperties) : {};
      default: return '';
    }
  }

  private createObjectFromProperties(properties: ParameterDefinition[]): any {
    const obj: any = {};
    properties.forEach(prop => {
      obj[prop.name] = this.getDefaultValue(prop);
    });
    return obj;
  }

  // Generate fake data
  generateFakeData() {
    const fakeData: { [key: string]: any } = {};
    
    this.detectedParameters().forEach(param => {
      fakeData[param.name] = this.generateFakeValue(param);
    });

    if (this.mode() === 'json') {
      this.jsonParameters.set(JSON.stringify(fakeData, null, 2));
    } else {
      this.parameterValues.set(fakeData);
    }
  }

  private generateFakeValue(param: ParameterDefinition): any {
    switch (param.type) {
      case 'string': return this.getFakeString(param.name);
      case 'number': return Math.floor(Math.random() * 1000) + 1;
      case 'boolean': return Math.random() > 0.5;
      case 'array':
        if (param.arrayItemType === 'object' && param.objectProperties) {
          return Array.from({ length: 3 }, () => this.generateFakeObject(param.objectProperties!));
        }
        // Generate better fake data for common array types
        return this.generateFakeArrayData(param.name);
      case 'object':
        return param.objectProperties ? this.generateFakeObject(param.objectProperties) : {};
      default: return '';
    }
  }

  private generateFakeObject(properties: ParameterDefinition[]): any {
    const obj: any = {};
    properties.forEach(prop => {
      obj[prop.name] = this.generateFakeValue(prop);
    });
    return obj;
  }

  private getFakeString(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('name')) return 'John Doe';
    if (lowerName.includes('email')) return 'john.doe@example.com';
    if (lowerName.includes('phone')) return '+1 (555) 123-4567';
    if (lowerName.includes('address')) return '123 Main Street, City, State 12345';
    if (lowerName.includes('company')) return 'Acme Corporation';
    if (lowerName.includes('title') || lowerName.includes('position')) return 'Software Developer';
    if (lowerName.includes('date')) return new Date().toLocaleDateString();
    if (lowerName.includes('amount') || lowerName.includes('price')) return '$1,234.56';
    
    return `Sample ${name}`;
  }

  private generateFakeArrayData(paramName: string): any[] {
    const lowerName = paramName.toLowerCase();
    
    if (lowerName.includes('experience')) {
      return [
        {
          role: 'Senior Software Developer',
          company: 'Tech Solutions Inc',
          from: '2021',
          to: '2023',
          responsibilities: [
            'Led development of web applications',
            'Mentored junior developers',
            'Improved system performance by 40%'
          ]
        },
        {
          role: 'Software Developer',
          company: 'StartUp Innovations',
          from: '2019',
          to: '2021',
          responsibilities: [
            'Developed REST APIs',
            'Implemented frontend features',
            'Collaborated with cross-functional teams'
          ]
        }
      ];
    }
    
    if (lowerName.includes('education')) {
      return [
        {
          degree: 'Bachelor of Computer Science',
          institution: 'University of Technology',
          year: '2019'
        },
        {
          degree: 'Master of Software Engineering',
          institution: 'Tech Institute',
          year: '2021'
        }
      ];
    }
    
    if (lowerName.includes('skill')) {
      return [
        'JavaScript/TypeScript',
        'Java/Spring Boot',
        'Angular/React',
        'SQL/NoSQL Databases',
        'AWS/Cloud Services',
        'Docker/Kubernetes'
      ];
    }
    
    if (lowerName.includes('transaction')) {
      return [
        {
          date: '2025-12-01',
          reference: 'TXN001',
          description: 'Salary Credit',
          debit: '',
          credit: '5000.00',
          balance: '15000.00'
        },
        {
          date: '2025-12-05',
          reference: 'TXN002', 
          description: 'ATM Withdrawal',
          debit: '500.00',
          credit: '',
          balance: '14500.00'
        },
        {
          date: '2025-12-10',
          reference: 'TXN003',
          description: 'Online Purchase',
          debit: '250.00',
          credit: '',
          balance: '14250.00'
        }
      ];
    }
    
    // Default array for other cases
    return ['Item 1', 'Item 2', 'Item 3'];
  }

  // Event handlers
  onClose() {
    this.close.emit();
  }

  onGeneratePdf() {
    let parameters: { [key: string]: any } = {};

    if (this.mode() === 'json') {
      try {
        if (this.jsonParameters().trim()) {
          parameters = JSON.parse(this.jsonParameters());
        }
        this.jsonError.set('');
      } catch (error) {
        this.jsonError.set('Invalid JSON format');
        return;
      }
    } else {
      parameters = { ...this.parameterValues() };
    }

    this.generatePdf.emit(parameters);
  }

  onSkipParameters() {
    this.skipParameters.emit();
  }

  // Parameter management
  updateParameterValue(paramName: string, value: any) {
    const current = this.parameterValues();
    current[paramName] = value;
    this.parameterValues.set({ ...current });
  }

  addArrayItem(paramName: string) {
    const current = this.parameterValues();
    const param = this.detectedParameters().find(p => p.name === paramName);
    
    if (param && param.type === 'array') {
      if (!Array.isArray(current[paramName])) {
        current[paramName] = [];
      }
      
      const newItem = param.arrayItemType === 'object' && param.objectProperties
        ? this.createObjectFromProperties(param.objectProperties)
        : '';
        
      current[paramName].push(newItem);
      this.parameterValues.set({ ...current });
    }
  }

  removeArrayItem(paramName: string, index: number) {
    const current = this.parameterValues();
    if (Array.isArray(current[paramName])) {
      current[paramName].splice(index, 1);
      this.parameterValues.set({ ...current });
    }
  }

  updateArrayItemProperty(paramName: string, itemIndex: number, propName: string, value: any) {
    const current = this.parameterValues();
    if (Array.isArray(current[paramName]) && current[paramName][itemIndex]) {
      current[paramName][itemIndex][propName] = value;
      this.parameterValues.set({ ...current });
    }
  }

  updateObjectProperty(paramName: string, propName: string, value: any) {
    const current = this.parameterValues();
    if (!current[paramName]) {
      current[paramName] = {};
    }
    current[paramName][propName] = value;
    this.parameterValues.set({ ...current });
  }
}