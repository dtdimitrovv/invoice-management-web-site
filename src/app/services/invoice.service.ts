import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceResponse } from '../models/invoice.model';
import { CompanyResponse } from '../models/company.model';
import { CreateInvoiceRequest } from '../models/invoice-item.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8080/invoices';
  private companiesUrl = 'http://localhost:8080/companies';

  constructor(private http: HttpClient) { }

  getInvoices(page: number = 0, size: number = 5, sort: string = 'issueDate,desc'): Observable<InvoiceResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    
    return this.http.get<InvoiceResponse>(this.apiUrl, { params });
  }

  getCompanies(): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(this.companiesUrl);
  }

  createInvoice(invoiceData: CreateInvoiceRequest): Observable<any> {
    return this.http.post(this.apiUrl, invoiceData);
  }
}
