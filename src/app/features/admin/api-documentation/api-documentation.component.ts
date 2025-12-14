import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ApiGuide {
  title: string;
  description: string;
  authentication: {
    method: string;
    header: string;
    format: string;
    example: string;
  };
  baseUrl: string;
  endpoints: Record<string, any>;
  commonParameters: Record<string, any>;
  examples: Record<string, any>;
  errorHandling: Record<string, string>;
  bestPractices: string[];
  rateLimits: Record<string, any>;
}

@Component({
  selector: 'app-api-documentation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">
                <i class="fas fa-book me-2"></i>
                API Keys Usage Guide
              </h4>
            </div>
            <div class="card-body">
              @if (guide(); as apiGuide) {
                <div class="mb-4">
                  <h5>{{ apiGuide.title }}</h5>
                  <p class="text-muted">{{ apiGuide.description }}</p>
                </div>

                <div class="mb-4">
                  <h5><i class="fas fa-key me-2"></i>Authentication</h5>
                  <div class="alert alert-info">
                    <strong>Method:</strong> {{ apiGuide.authentication['method'] }}<br>
                    <strong>Header:</strong> <code>{{ apiGuide.authentication['header'] }}</code><br>
                    <strong>Format:</strong> {{ apiGuide.authentication['format'] }}<br>
                    <strong>Example:</strong> <code>{{ apiGuide.authentication['example'] }}</code>
                  </div>
                </div>

                <div class="mb-4">
                  <h5><i class="fas fa-link me-2"></i>Base URL</h5>
                  <code class="bg-light p-2 d-block">{{ apiGuide.baseUrl }}</code>
                </div>

                <div class="mb-4">
                  <h5><i class="fas fa-endpoints me-2"></i>Available Endpoints</h5>
                  <div class="tabs">
                    @for (endpoint of getEndpointEntries(apiGuide.endpoints); track endpoint.key) {
                      <button class="tab-btn" [class.active]="activeEndpoint() === endpoint.key" (click)="selectEndpoint(endpoint.key)">
                        {{ endpoint.value['description'] }}
                      </button>
                    }
                  </div>
                  @if (activeEndpoint(); as key) {
                    <div class="card mt-3">
                      <div class="card-body">
                        <p><strong>Base URL:</strong> <code>{{ apiGuide.endpoints[key]['url'] }}</code></p>
                        <h6>Methods:</h6>
                        <ul class="list-unstyled">
                          @for (method of getObjectEntries(apiGuide.endpoints[key]['methods']); track method.key) {
                            <li class="mb-1">
                              <span class="badge bg-primary me-2">{{ method.key }}</span>
                              {{ method.value }}
                            </li>
                          }
                        </ul>
                        @if (apiGuide.endpoints[key]['filters']) {
                          <h6>Available Filters:</h6>
                          <ul class="list-unstyled">
                            @for (filter of getObjectEntries(apiGuide.endpoints[key]['filters']); track filter.key) {
                              <li class="mb-1"><code>{{ filter.key }}</code> - {{ filter.value }}</li>
                            }
                          </ul>
                        }

                        <h6 class="mt-3">Examples:</h6>
                        @for (example of getExamplesFor(key, apiGuide.examples); track example.key) {
                          <div class="mb-3">
                            <h6 class="mb-1">{{ example.value['description'] }}</h6>
                            @if (example.value['curl']) {
                              <pre class="bg-dark text-light p-3 rounded"><code>{{ example.value['curl'] }}</code></pre>
                            }
                            @if (example.value['javascript']) {
                              <pre class="bg-dark text-light p-3 rounded"><code>{{ example.value['javascript'] }}</code></pre>
                            }
                            @if (example.value['response']) {
                              <pre class="bg-light p-3 rounded"><code>{{ formatJson(example.value['response']) }}</code></pre>
                            }
                          </div>
                        }

                        <h6 class="mt-3">Common Parameters:</h6>
                        @for (paramGroup of getObjectEntries(apiGuide.commonParameters); track paramGroup.key) {
                          <div class="mb-2">
                            <strong>{{ paramGroup.key | titlecase }}:</strong>
                            <ul class="list-unstyled mb-0">
                              @for (param of getObjectEntries(paramGroup.value); track param.key) {
                                <li><code>{{ param.key }}</code> - {{ param.value }}</li>
                              }
                            </ul>
                          </div>
                        }

                        <h6 class="mt-3">Error Handling:</h6>
                        <div class="table-responsive">
                          <table class="table table-striped">
                            <thead>
                              <tr>
                                <th>Status Code</th>
                                <th>Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (error of getObjectEntries(apiGuide.errorHandling); track error.key) {
                                <tr>
                                  <td><span class="badge bg-danger">{{ error.key }}</span></td>
                                  <td>{{ error.value }}</td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>

                        <h6 class="mt-3">Rate Limits:</h6>
                        <div class="alert alert-warning">
                          <p class="mb-1">{{ apiGuide.rateLimits['description'] }}</p>
                          <p class="mb-2"><strong>Limits:</strong> {{ apiGuide.rateLimits['limits'] }}</p>
                          <strong>Response Headers:</strong>
                          <ul class="mb-0">
                            @for (header of getObjectEntries(apiGuide.rateLimits['headers']); track header.key) {
                              <li><code>{{ header.key }}</code> - {{ header.value }}</li>
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <div class="mb-4">
                  <h5><i class="fas fa-sliders-h me-2"></i>Common Parameters</h5>
                  
                  @for (paramGroup of getObjectEntries(apiGuide.commonParameters); track paramGroup.key) {
                    <div class="mb-3">
                      <h6>{{ paramGroup.key | titlecase }}:</h6>
                      <ul class="list-unstyled">
                        @for (param of getObjectEntries(paramGroup.value); track param.key) {
                          <li><code>{{ param.key }}</code> - {{ param.value }}</li>
                        }
                      </ul>
                    </div>
                  }
                </div>

                <div class="mb-4">
                  <h5><i class="fas fa-code me-2"></i>Examples</h5>
                  
                  @for (example of getObjectEntries(apiGuide.examples); track example.key) {
                    <div class="card mb-3">
                      <div class="card-header">
                        <h6 class="mb-0">{{ example.value['description'] }}</h6>
                      </div>
                      <div class="card-body">
                        @if (example.value['curl']) {
                          <h6>cURL:</h6>
                          <pre class="bg-dark text-light p-3 rounded"><code>{{ example.value['curl'] }}</code></pre>
                        }
                        
                        @if (example.value['javascript']) {
                          <h6>JavaScript:</h6>
                          <pre class="bg-dark text-light p-3 rounded"><code>{{ example.value['javascript'] }}</code></pre>
                        }
                        
                        @if (example.value['response']) {
                          <h6>Response:</h6>
                          <pre class="bg-light p-3 rounded"><code>{{ formatJson(example.value['response']) }}</code></pre>
                        }
                      </div>
                    </div>
                  }
                </div>

                <div class="mb-4">
                  <h5><i class="fas fa-exclamation-triangle me-2"></i>Error Handling</h5>
                  <div class="table-responsive">
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th>Status Code</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (error of getObjectEntries(apiGuide.errorHandling); track error.key) {
                          <tr>
                            <td><span class="badge bg-danger">{{ error.key }}</span></td>
                            <td>{{ error.value }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="mb-4">
                  <h5><i class="fas fa-lightbulb me-2"></i>Best Practices</h5>
                  <ul>
                    @for (practice of apiGuide.bestPractices; track practice) {
                      <li class="mb-2">{{ practice }}</li>
                    }
                  </ul>
                </div>

                <div class="mb-4">
                  <h5><i class="fas fa-tachometer-alt me-2"></i>Rate Limits</h5>
                  <div class="alert alert-warning">
                    <p>{{ apiGuide.rateLimits['description'] }}</p>
                    <p><strong>Limits:</strong> {{ apiGuide.rateLimits['limits'] }}</p>
                    
                    <h6>Response Headers:</h6>
                    <ul class="mb-0">
                      @for (header of getObjectEntries(apiGuide.rateLimits['headers']); track header.key) {
                        <li><code>{{ header.key }}</code> - {{ header.value }}</li>
                      }
                    </ul>
                  </div>
                </div>
              } @else {
                <div class="text-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading API documentation...</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    code {
      font-size: 0.9em;
    }
    
    .card-header h6 {
      color: #495057;
    }
    
    .badge {
      font-size: 0.8em;
    }
    
    .alert {
      border-left: 4px solid;
    }
    
    .alert-info {
      border-left-color: #17a2b8;
    }
    
    .alert-warning {
      border-left-color: #ffc107;
    }
    
    .tabs {
      display: flex;
      gap: .5rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding: .25rem 0;
    }
    
    .tab-btn {
      flex: 0 0 auto;
      border: 1px solid #dee2e6;
      background: #fff;
      color: #495057;
      border-radius: .5rem;
      padding: .5rem .75rem;
      font-size: .9rem;
      cursor: pointer;
      transition: background .2s ease;
    }
    
    .tab-btn:hover {
      background: #f8f9fa;
    }
    
    .tab-btn.active {
      background: #2a7ae4;
      color: #fff;
      border-color: #2a7ae4;
    }
  `]
})
export class ApiDocumentationComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/documentation/api-keys`;
  
  guide = signal<ApiGuide | null>(null);
  activeEndpoint = signal<string>('');

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadApiGuide();
  }

  private loadApiGuide() {
    this.http.get<ApiGuide>(this.apiUrl).subscribe({
      next: (data) => {
        this.guide.set(data);
        const keys = Object.keys(data.endpoints || {});
        this.activeEndpoint.set(keys[0] || '');
      },
      error: (error) => {
        console.error('Failed to load API guide:', error);
      }
    });
  }

  getObjectEntries(obj: any): Array<{key: string, value: any}> {
    if (!obj) return [];
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  getEndpointEntries(endpoints: any): Array<{key: string, value: any}> {
    return this.getObjectEntries(endpoints);
  }
  
  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  selectEndpoint(key: string) {
    this.activeEndpoint.set(key);
  }

  getExamplesFor(key: string, examples: any): Array<{key: string, value: any}> {
    if (!examples) return [];
    const endpointExamples = examples[key];
    if (endpointExamples && typeof endpointExamples === 'object') {
      return this.getObjectEntries(endpointExamples);
    }
    return this.getObjectEntries(examples);
  }
}
