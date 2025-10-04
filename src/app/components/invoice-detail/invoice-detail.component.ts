import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.css'
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | undefined;
  invoiceType: string = '';
  returnPage: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
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
}
