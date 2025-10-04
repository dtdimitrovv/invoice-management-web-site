import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../services/invoice.service';
import { ToastService } from '../../services/toast.service';
import { CompanyCreationRequest } from '../../models/company.model';

@Component({
  selector: 'app-create-company-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-company-modal.component.html',
  styleUrl: './create-company-modal.component.css'
})
export class CreateCompanyModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() companyCreated = new EventEmitter<CompanyCreationRequest>();

  loading = false;
  
  // Form data
  companyData: CompanyCreationRequest = {
    name: '',
    address: '',
    identityNumber: '',
    vatNumber: '',
    responsibleOfficerName: '',
    bankIdentifierCode: '',
    bankName: '',
    iban: ''
  };

  // Inject services using the inject() function
  private invoiceService = inject(InvoiceService);
  private toastService = inject(ToastService);

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.loading = true;
      
      this.invoiceService.createCompany(this.companyData).subscribe({
        next: (response) => {
          this.loading = false;
          this.toastService.success('Компанията беше създадена успешно!');
          this.companyCreated.emit(this.companyData);
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating company:', error);
          this.loading = false;
          this.toastService.error('Възникна грешка при създаването на компанията. Моля, опитайте отново.');
        }
      });
    } else {
      this.toastService.error('Моля, попълнете всички задължителни полета.');
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.companyData.name.trim() &&
      this.companyData.address.trim() &&
      this.companyData.identityNumber.trim() &&
      this.companyData.vatNumber.trim() &&
      this.companyData.responsibleOfficerName.trim() &&
      this.companyData.bankIdentifierCode.trim() &&
      this.companyData.bankName.trim() &&
      this.companyData.iban.trim()
    );
  }

  private resetForm(): void {
    this.companyData = {
      name: '',
      address: '',
      identityNumber: '',
      vatNumber: '',
      responsibleOfficerName: '',
      bankIdentifierCode: '',
      bankName: '',
      iban: ''
    };
  }
}
