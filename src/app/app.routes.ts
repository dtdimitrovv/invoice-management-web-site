import { Routes } from '@angular/router';
import { InvoiceDetailComponent } from './components/invoice-detail/invoice-detail.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: 'invoice/:id', component: InvoiceDetailComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' }
];
