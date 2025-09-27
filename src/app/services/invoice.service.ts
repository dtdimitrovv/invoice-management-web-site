import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceResponse } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8080/invoices';

  constructor(private http: HttpClient) { }

  getInvoices(): Observable<InvoiceResponse> {
    return this.http.get<InvoiceResponse>(this.apiUrl);
  }
}
