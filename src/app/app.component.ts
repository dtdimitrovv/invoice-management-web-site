import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InvoiceService } from './services/invoice.service';
import { Invoice, InvoiceResponse } from './models/invoice.model';
import { DateFormatPipe } from './pipes/date-format.pipe';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, DateFormatPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Управление на фактури';
  invoices: Invoice[] = [];
  loading = true;
  error: string | null = null;

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.error = null;
    
    this.invoiceService.getInvoices().subscribe({
      next: (response: InvoiceResponse) => {
        this.invoices = response.content;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load invoices. Please try again.';
        this.loading = false;
        console.error('Error loading invoices:', error);
      }
    });
  }

  onViewInvoice(invoice: Invoice): void {
    // TODO: Implement view functionality
    console.log('View invoice:', invoice);
  }
}
