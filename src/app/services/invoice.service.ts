import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceResponse } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8080/invoices';

  constructor(private http: HttpClient) { }

  getInvoices(page: number = 0, size: number = 5): Observable<InvoiceResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<InvoiceResponse>(this.apiUrl, { params });
  }
}
