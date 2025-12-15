import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip interceptor for asset requests (theme, translations, etc.)
  const isAssetRequest = req.url.startsWith('/assets') || 
                         req.url.includes('/assets/') ||
                         req.url.startsWith('assets/') ||
                         req.url.startsWith('./assets/');
  
  // Only add base URL if:
  // 1. The request doesn't already have a full URL
  // 2. It's not an asset request
  if (!req.url.startsWith('http') && !isAssetRequest) {
    req = req.clone({
      url: `${environment.apiUrl}${req.url}`
    });
  }
  
  return next(req);
};
