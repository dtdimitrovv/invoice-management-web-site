import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceResponse } from '../models/invoice.model';
import { Company, CompanyResponse, CompanyCreationRequest } from '../models/company.model';
import { CreateInvoiceRequest } from '../models/invoice-item.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8080/invoices';
  private companiesUrl = 'http://localhost:8080/companies';

  constructor(private http: HttpClient) { }

  getInvoices(page: number = 0, size: number = 5, sort: string[] = ['issueDate,desc', 'serialNumber,desc']): Observable<InvoiceResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    // Add each sort parameter separately
    sort.forEach(sortParam => {
      params = params.append('sort', sortParam);
    });
    
    return this.http.get<InvoiceResponse>(this.apiUrl, { params });
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.companiesUrl);
  }

  createInvoice(invoiceData: CreateInvoiceRequest): Observable<any> {
    return this.http.post(this.apiUrl, invoiceData);
  }

  createCompany(companyData: CompanyCreationRequest): Observable<any> {
    return this.http.post(this.companiesUrl, companyData);
  }

  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${this.companiesUrl}/${id}`);
  }
}
