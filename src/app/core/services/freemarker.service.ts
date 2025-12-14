import { Injectable } from '@angular/core';

export interface FreeMarkerVariable {
  name: string;
  type: 'attribute' | 'detected';
  source?: string;
}

export interface FreeMarkerCondition {
  variable: string;
  operator: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class FreeMarkerService {

  // Extract all ${...} variables from content
  extractVariables(content: string): FreeMarkerVariable[] {
    const regex = /\$\{([^}]+)\}/g;
    const matches = content.matchAll(regex);
    const variables = new Set<string>();
    
    for (const match of matches) {
      variables.add(match[1].trim());
    }
    
    return Array.from(variables).map(name => ({
      name,
      type: 'detected' as const
    }));
  }

  // Extract all <#list ...> loops
  extractLists(content: string): string[] {
    const regex = /<#list\s+(\w+)\s+as\s+\w+>/g;
    const matches = content.matchAll(regex);
    const lists = new Set<string>();
    
    for (const match of matches) {
      lists.add(match[1]);
    }
    
    return Array.from(lists);
  }

  // Generate FreeMarker variable syntax
  generateVariable(name: string): string {
    return `\${${name}}`;
  }

  // Generate FreeMarker if statement
  generateIf(condition: FreeMarkerCondition, hasElse: boolean = false): string {
    const { variable, operator, value } = condition;
    let code = `<#if ${variable} ${operator} ${value}>\n  \n`;
    
    if (hasElse) {
      code += `<#else>\n  \n`;
    }
    
    code += `</#if>`;
    return code;
  }

  // Generate FreeMarker for loop
  generateForLoop(listVariable: string, itemName: string): string {
    return `<#list ${listVariable} as ${itemName}>\n  \${${itemName}}\n</#list>`;
  }

  // Generate FreeMarker assign
  generateAssign(name: string, value: string): string {
    return `<#assign ${name} = ${value}>`;
  }

  // Generate FreeMarker comment
  generateComment(text: string): string {
    return `<#-- ${text} -->`;
  }

  // Validate FreeMarker syntax (basic validation)
  validateSyntax(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for unclosed tags
    const ifCount = (content.match(/<#if/g) || []).length;
    const endIfCount = (content.match(/<\/#if>/g) || []).length;
    if (ifCount !== endIfCount) {
      errors.push(`Unclosed <#if> tags: ${ifCount} opening, ${endIfCount} closing`);
    }
    
    const listCount = (content.match(/<#list/g) || []).length;
    const endListCount = (content.match(/<\/#list>/g) || []).length;
    if (listCount !== endListCount) {
      errors.push(`Unclosed <#list> tags: ${listCount} opening, ${endListCount} closing`);
    }
    
    // Check for malformed variables
    const malformedVars = content.match(/\$\{[^}]*$/g);
    if (malformedVars) {
      errors.push('Malformed variable syntax detected');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get available operators
  getOperators(): Array<{ value: string; label: string }> {
    return [
      { value: '==', label: 'equals' },
      { value: '!=', label: 'not equals' },
      { value: '>', label: 'greater than' },
      { value: '<', label: 'less than' },
      { value: '>=', label: 'greater or equal' },
      { value: '<=', label: 'less or equal' },
      { value: '??', label: 'exists' },
      { value: '!', label: 'not' }
    ];
  }

  // Wrap selected text with FreeMarker tag
  wrapWithTag(text: string, tagType: 'if' | 'list', params: any): string {
    if (tagType === 'if') {
      const { condition } = params;
      return `<#if ${condition}>\n${text}\n</#if>`;
    } else if (tagType === 'list') {
      const { listVar, itemName } = params;
      return `<#list ${listVar} as ${itemName}>\n${text}\n</#list>`;
    }
    return text;
  }
}
