import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-companies-list-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companies-list-modal.component.html',
  styleUrl: './companies-list-modal.component.css'
})
export class CompaniesListModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() companyDeleted = new EventEmitter<void>();

  companies: Company[] = [];
  loading = false;
  error: string | null = null;

  // Inject services using the inject() function
  private invoiceService = inject(InvoiceService);

  ngOnInit(): void {
    if (this.isOpen) {
      this.loadCompanies();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.loadCompanies();
    }
  }

  loadCompanies(): void {
    this.loading = true;
    this.error = null;
    
    this.invoiceService.getCompanies().subscribe({
      next: (companies: Company[]) => {
        this.companies = companies.filter((company: Company) => company.type === 'CUSTOMER') || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Грешка при зареждане на компании. Моля, опитайте отново.';
        this.loading = false;
        console.error('Грешка при зареждане на компании:', error);
      }
    });
  }

  deleteCompany(id: number): void {
    if (confirm('Сигурни ли сте, че искате да изтриете тази компания?')) {
      this.invoiceService.deleteCompany(id).subscribe({
        next: () => {
          // Remove the company from the local array
          this.companies = this.companies.filter(company => company.id !== id);
          // Emit event to refresh other components
          this.companyDeleted.emit();
        },
        error: (error) => {
          console.error('Грешка при изтриване на компанията:', error);
          alert('Грешка при изтриване на компанията. Моля опитайте отново.');
        }
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
