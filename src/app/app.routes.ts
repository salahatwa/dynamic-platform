import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'pricing',
    loadComponent: () => import('./features/pricing/pricing.component').then(m => m.PricingComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/landing/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'accept-invitation/:token',
    loadComponent: () => import('./features/auth/accept-invitation/accept-invitation.component').then(m => m.AcceptInvitationComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'apps',
        loadComponent: () => import('./features/admin/apps/apps.component').then(m => m.AppsComponent)
      },
      {
        path: 'apps/create',
        loadComponent: () => import('./features/admin/apps/app-create/app-create.component').then(m => m.AppCreateComponent)
      },
      {
        path: 'apps/edit/:id',
        loadComponent: () => import('./features/admin/apps/app-edit/app-edit.component').then(m => m.AppEditComponent)
      },
      {
        path: 'templates',
        loadComponent: () => import('./features/admin/templates/templates.component').then(m => m.TemplatesComponent)
      },
      {
        path: 'template-editor',
        loadComponent: () => import('./features/admin/templates/template-editor-enhanced/template-editor-enhanced.component').then(m => m.TemplateEditorEnhancedComponent)
      },
      {
        path: 'template-editor/:id',
        loadComponent: () => import('./features/admin/templates/template-editor-enhanced/template-editor-enhanced.component').then(m => m.TemplateEditorEnhancedComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'api-keys',
        loadComponent: () => import('./features/admin/api-keys/api-keys.component').then(m => m.ApiKeysComponent)
      },
      {
        path: 'api-documentation',
        loadComponent: () => import('./features/admin/api-documentation/api-documentation.component').then(m => m.ApiDocumentationComponent)
      },
      {
        path: 'invitations',
        loadComponent: () => import('./features/admin/invitations/invitations.component').then(m => m.InvitationsComponent)
      },
      {
        path: 'translations',
        loadComponent: () => import('./features/admin/translations/translations.component').then(m => m.TranslationsComponent)
      },
      {
        path: 'lov',
        loadComponent: () => import('./features/admin/lov-management/lov-management.component').then(m => m.LovManagementComponent)
      },
      {
        path: 'lov/values',
        loadComponent: () => import('./features/admin/lov-values-editor/lov-values-editor.component').then(m => m.LovValuesEditorComponent)
      },
      {
        path: 'config',
        loadComponent: () => import('./features/admin/app-config-management/app-config-management.component').then(m => m.AppConfigManagementComponent)
      },
      {
        path: 'error-codes',
        loadComponent: () => import('./features/admin/error-code-management/error-code-management.component').then(m => m.ErrorCodeManagementComponent)
      },
      {
        path: 'media',
        loadComponent: () => import('./features/admin/media/media.component').then(m => m.MediaComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
