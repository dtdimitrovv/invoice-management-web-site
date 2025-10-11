import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { ToastService } from '../../services/toast.service';
import { Invoice } from '../../models/invoice.model';
import { InvoiceItem, CreateInvoiceRequest, InvoiceContent } from '../../models/invoice-item.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DateFormatPipe],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.css'
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | undefined;
  invoiceType: string = '';
  returnPage: number = 0;
  
  // Edit mode properties
  isEditMode: boolean = false;
  isEditable: boolean = false;
  editableItems: InvoiceItem[] = [];
  originalItems: InvoiceItem[] = [];
  nextItemId = 1;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const invoiceId = this.route.snapshot.paramMap.get('id');
    const pageParam = this.route.snapshot.queryParamMap.get('page');
    this.returnPage = pageParam ? +pageParam : 0;
    
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
        } else {
          this.checkIfEditable();
          this.initializeEditableItems();
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

  goBack(): void {
    this.router.navigate(['/']);
  }

  printInvoice(type: 'original' | 'copy'): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('PDF generation is only available in browser environment');
      return;
    }

    // Set the invoice type for display
    this.invoiceType = type === 'original' ? 'Оригинал' : 'Копие';

    // Dynamically import the libraries only in browser
    Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]).then(([jsPDF, html2canvas]) => {
      const element = document.querySelector('.invoice-detail-container') as HTMLElement;
      const actionsElement = document.querySelector('.invoice-actions') as HTMLElement;
      
      if (!element) {
        console.error('Invoice container not found');
        return;
      }

      // Hide the action buttons before capturing
      if (actionsElement) {
        actionsElement.style.display = 'none';
      }

      html2canvas.default(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        // Show the action buttons again after capturing
        if (actionsElement) {
          actionsElement.style.display = 'flex';
        }

        // Clear the invoice type after capturing
        this.invoiceType = '';

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF.jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        const fileName = `invoice-${this.invoice?.serialNumber || 'unknown'}-${type}.pdf`;
        pdf.save(fileName);
      }).catch(error => {
        // Make sure to show buttons again even if there's an error
        if (actionsElement) {
          actionsElement.style.display = 'flex';
        }
        // Clear the invoice type even if there's an error
        this.invoiceType = '';
        console.error('Error generating PDF:', error);
      });
    }).catch(error => {
      console.error('Error loading PDF libraries:', error);
    });
  }

  getTaxableBase(): number {
    return this.invoice?.totalPriceWithoutVatInBulgarianLev || 0;
  }

  getVAT(): number {
    return this.invoice?.vatSumInBulgarianLev || 0;
  }

  getTotalAmountInBulgarianLev(): number {
    return this.invoice?.totalPriceWithVatInBulgarianLev || 0;
  }

  getTotalAmountInEuro(): number {
    return this.invoice?.totalPriceWithVatInEuro || 0;
  }

  checkIfEditable(): void {
    if (!this.invoice?.issueDate) {
      this.isEditable = false;
      return;
    }

    const invoiceDate = new Date(this.invoice.issueDate[0], this.invoice.issueDate[1] - 1, this.invoice.issueDate[2]);
    const currentDate = new Date();
    
    // Check if invoice was created in the same month and year as current date
    this.isEditable = invoiceDate.getMonth() === currentDate.getMonth() && 
                     invoiceDate.getFullYear() === currentDate.getFullYear();
  }

  initializeEditableItems(): void {
    if (!this.invoice?.contents) return;
    
    this.editableItems = this.invoice.contents.map((content, index) => ({
      id: index + 1,
      name: content.serviceDescription,
      quantity: content.quantity,
      unitPrice: content.unitPrice,
      discount: content.discount
    }));
    
    this.originalItems = JSON.parse(JSON.stringify(this.editableItems));
    this.nextItemId = this.editableItems.length + 1;
  }

  toggleEditMode(): void {
    if (!this.isEditable) return;
    
    this.isEditMode = !this.isEditMode;
    
    if (!this.isEditMode) {
      // Cancel edit mode - revert to original items
      this.editableItems = JSON.parse(JSON.stringify(this.originalItems));
    }
  }

  addItem(): void {
    const newItem: InvoiceItem = {
      id: this.nextItemId++,
      name: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0
    };
    this.editableItems.push(newItem);
  }

  removeItem(index: number): void {
    if (this.editableItems.length > 1) {
      this.editableItems.splice(index, 1);
    } else {
      this.toastService.warning('Не можете да премахнете последния артикул. Добавете нов артикул преди да премахнете този.');
    }
  }

  calculateItemTotal(item: InvoiceItem): number {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  }

  get calculateTotal(): number {
    return this.editableItems.reduce((total, item) => total + this.calculateItemTotal(item), 0);
  }

  saveChanges(): void {
    if (!this.invoice?.id) return;

    // Convert editable items to InvoiceContent format
    const contents: InvoiceContent[] = this.editableItems
      .filter(item => item.name.trim() !== '')
      .map(item => ({
        serviceDescription: item.name,
        unitPrice: Number(item.unitPrice),
        quantity: Number(item.quantity),
        discount: Number(item.discount)
      }));

    if (contents.length === 0) {
      this.toastService.error('Моля, добавете поне един артикул с име.');
      return;
    }

    this.loading = true;

    const updateData: CreateInvoiceRequest = {
      clientId: this.invoice.client.id,
      contents: contents,
      reasonForSkippingVat: this.invoice.reasonForSkippingVat
    };

    this.invoiceService.updateInvoice(this.invoice.id, updateData).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastService.success('Фактурата беше обновена успешно!');
        this.isEditMode = false;
        // Reload the invoice to get updated data
        this.loadInvoice(this.invoice!.id);
      },
      error: (error) => {
        console.error('Error updating invoice:', error);
        this.loading = false;
        this.toastService.error('Възникна грешка при обновяването на фактурата. Моля, опитайте отново.');
      }
    });
  }
}
