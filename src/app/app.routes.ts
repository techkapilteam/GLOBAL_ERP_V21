import { Routes } from '@angular/router';
import { LoginComponent } from './shared/login/login.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/main-layout/main-layout.component/main-layout.component';
import { DashboardComponent } from './shared/dashboard/dashboard.component/dashboard.component';
import { GeneralReceipt } from './features/accounts/Accounts_Reports/general-receipt/general-receipt';
import { JournalVoucher } from './features/accounts/Accounts_Reports/journal-voucher/journal-voucher';
import { PaymentVoucher } from './features/accounts/Accounts_Reports/payment-voucher/payment-voucher';

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
    path: 'journal-voucher/:id',
    component: JournalVoucher
  },
  {
    path: 'payment-voucher/:id',
    component: PaymentVoucher
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
