import { Routes } from '@angular/router';
import { LoginComponent } from './shared/login/login.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/main-layout/main-layout.component/main-layout.component';
import { DashboardComponent } from './shared/dashboard/dashboard.component/dashboard.component';
import { GeneralReceipt } from './features/accounts/Accounts_Reports/general-receipt/general-receipt';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'accounts',
        loadChildren: () => import('./features/accounts/accounts_routs').then(m => m.accountsRoutes)
      }
    ]
  },

  // reports
  {
    path: 'general-receipt/:id',
    component: GeneralReceipt
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
