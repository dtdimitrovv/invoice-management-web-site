import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../services/invoice.service';
import { ToastService } from '../services/toast.service';
import { Company } from '../models/company.model';
import { InvoiceItem, CreateInvoiceRequest, InvoiceContent } from '../models/invoice-item.model';

@Component({
  selector: 'app-create-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-invoice-modal.component.html',
  styleUrl: './create-invoice-modal.component.css'
})
export class CreateInvoiceModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() invoiceCreated = new EventEmitter<CreateInvoiceRequest>();

  customers: Company[] = [];
  suppliers: Company[] = [];
  selectedClientId: number | null = null;
  selectedSupplierId: number | null = null;
  reasonForSkippingVat: string = '';
  loading = false;
  
  // Items management
  items: InvoiceItem[] = [];
  nextItemId = 1;

  // Inject services using the inject() function
  private invoiceService = inject(InvoiceService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.loadCompanies();
    this.addItem(); // Add one item by default
  }

  loadCompanies(): void {
    this.invoiceService.getCompanies().subscribe({
      next: (response) => {
        this.customers = response.content.filter(company => company.type === 'CUSTOMER');
        this.suppliers = response.content.filter(company => company.type === 'SUPPLIER');
        
        // Auto-select supplier if there's only one
        if (this.suppliers.length === 1) {
          this.selectedSupplierId = this.suppliers[0].id;
        }
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  addItem(): void {
    const newItem: InvoiceItem = {
      id: this.nextItemId++,
      name: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0
    };
    this.items.push(newItem);
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  calculateItemTotal(item: InvoiceItem): number {
    // Ensure we're working with numbers, not strings
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  }

  get calculateTotal(): number {
    return this.items.reduce((total, item) => total + this.calculateItemTotal(item), 0);
  }

  onSubmit(): void {
    // Convert items to the API format first
    const contents: InvoiceContent[] = this.items
      .filter(item => item.name.trim() !== '') // Only include items with names
      .map(item => ({
        serviceDescription: item.name,
        unitPrice: Number(item.unitPrice),
        quantity: Number(item.quantity),
        discount: Number(item.discount)
      }));
    
    if (this.selectedClientId && contents.length > 0) {
      this.loading = true;
      
      const invoiceData: CreateInvoiceRequest = {
        clientId: this.selectedClientId,
        contents: contents,
        reasonForSkippingVat: this.reasonForSkippingVat.trim() || undefined
      };
      
      this.invoiceService.createInvoice(invoiceData).subscribe({
        next: (response) => {
          this.loading = false;
          this.toastService.success('Фактурата беше създадена успешно!');
          this.invoiceCreated.emit(invoiceData);
          this.resetForm(); // Reset the form for next use
          // Don't call onClose() here - let the parent component handle closing
        },
        error: (error) => {
          console.error('Error creating invoice:', error);
          this.loading = false;
          this.toastService.error('Възникна грешка при създаването на фактурата. Моля, опитайте отново.');
        }
      });
    } else {
      if (!this.selectedClientId) {
        this.toastService.error('Моля, изберете клиент.');
      } else if (contents.length === 0) {
        this.toastService.error('Моля, добавете поне един артикул с име.');
      }
    }
  }

  resetForm(): void {
    this.selectedClientId = null;
    this.selectedSupplierId = null;
    this.reasonForSkippingVat = '';
    this.items = [];
    this.nextItemId = 1;
    
    // Re-apply auto-selection for supplier if there's only one
    if (this.suppliers.length === 1) {
      this.selectedSupplierId = this.suppliers[0].id;
    }
    
    // Add one default item
    this.addItem();
  }
}