import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from './services/invoice.service';
import { Invoice, InvoiceResponse } from './models/invoice.model';
import { DateFormatPipe } from './pipes/date-format.pipe';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, DateFormatPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Управление на фактури';
  invoices: Invoice[] = [];
  loading = true;
  error: string | null = null;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 20, 25, 50, 100];

  constructor(
    private invoiceService: InvoiceService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Only load invoices in browser environment, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.loadInvoices();
    } else {
      // During SSR, just set loading to false
      this.loading = false;
    }
  }

  loadInvoices(): void {
    this.loading = true;
    this.error = null;
    
    this.invoiceService.getInvoices(this.currentPage, this.pageSize).subscribe({
      next: (response: InvoiceResponse) => {
        this.invoices = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load invoices. Please try again.';
        this.loading = false;
        console.error('Error loading invoices:', error);
      }
    });
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0; // Reset to first page when changing page size
    this.loadInvoices();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadInvoices();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onViewInvoice(invoice: Invoice): void {
    // TODO: Implement view functionality
    console.log('View invoice:', invoice);
  }
}
