import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { apiInterceptor } from './app/core/interceptors/api.interceptor';
import { ErrorInterceptor } from './app/core/interceptors/error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor, authInterceptor])),
    provideAnimations(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ]
}).catch(err => console.error(err));
