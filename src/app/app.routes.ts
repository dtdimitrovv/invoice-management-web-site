import { Routes } from '@angular/router';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'invoice/:id', component: InvoiceDetailComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' }
];
