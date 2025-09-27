import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../services/invoice.service';
import { Invoice } from '../models/invoice.model';
import { DateFormatPipe } from '../pipes/date-format.pipe';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.css'
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    const invoiceId = this.route.snapshot.paramMap.get('id');
    if (invoiceId) {
      this.loadInvoice(+invoiceId);
    }
  }

  loadInvoice(id: number): void {
    // For now, we'll load all invoices and find the one with matching ID
    // In a real app, you'd have a specific endpoint for single invoice
    this.invoiceService.getInvoices(0, 100).subscribe({
      next: (response) => {
        this.invoice = response.content.find(inv => inv.id === id);
        if (!this.invoice) {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.router.navigate(['/']);
      }
    });
  }

  getCityFromAddress(address: string | undefined): string {
    if (!address) return '';
    // Extract city from address - this is a simple implementation
    // You might need to adjust based on your address format
    const parts = address.split(',');
    return parts.length > 1 ? parts[1].trim() : address;
  }

  getFormattedInvoiceNumber(): string {
    if (!this.invoice?.serialNumber) return '0000000000';
    return this.invoice.serialNumber.toString().padStart(10, '0');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  printInvoice(): void {
    window.print();
  }
}
