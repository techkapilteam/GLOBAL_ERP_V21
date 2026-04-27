import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { Observable, catchError, from, tap, throwError, timeout } from 'rxjs';
import { environment } from '../../../envir/environment';
import { AuthService } from '../../core/services/auth.service';
import { CommonService } from '../../core/services/Common/common.service';

export interface SosTicket {
  id: string;
  createdAt: string;
  status: 'Open' | 'Submitted' | 'Pending Backend' | 'Failed' | 'Solved';
  category: string;
  priority: string;
  subject: string;
  message: string;
  contact: string;
  pageUrl: string;
  userName: string;
  userId: number;
  companyCode: string;
  branchCode: string;
  lastAttemptAt?: string;
  attachmentCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SosTicketService {
  private readonly storageKey = 'erp-sos-tickets';
  private readonly apiPath = '/Support/CreateSosTicket';
  private readonly defaultSupportEmail = 'harishg@kapilit.com';
  private readonly ejs = environment.emailjs;

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private http: HttpClient
  ) {
    if (this.ejs.publicKey && !this.ejs.publicKey.startsWith('YOUR_')) {
      emailjs.init({ publicKey: this.ejs.publicKey });
    }
  }

  createTicket(input: Pick<SosTicket, 'category' | 'priority' | 'subject' | 'message' | 'contact'>, attachmentCount = 0): SosTicket {
    const ticket: SosTicket = {
      id: this.createTicketId(),
      createdAt: new Date().toISOString(),
      status: 'Open',
      pageUrl: window.location.href,
      userName: this.authService.getUsername() || 'Unknown User',
      userId: this.authService.getUserId(),
      companyCode: this.authService.getCompanyCode(),
      branchCode: this.authService.getBranchCode(),
      attachmentCount: attachmentCount || undefined,
      ...input
    };

    this.saveTicket(ticket);
    return ticket;
  }

  submitTicket(ticket: SosTicket, files: File[] = []): Observable<any> {
    const ejsConfigured = this.ejs.publicKey && !this.ejs.publicKey.startsWith('YOUR_');

    if (ejsConfigured) {
      return this.submitViaEmailJS(ticket).pipe(
        timeout(20000),
        tap(() => this.updateTicketStatus(ticket.id, 'Submitted')),
        catchError(() => this.fallbackToBackend(ticket, files))
      );
    }

    return this.submitToBackend(ticket, files);
  }

  private submitViaEmailJS(ticket: SosTicket): Observable<any> {
    const templateParams = {
      to_email: this.defaultSupportEmail,
      ticket_id: ticket.id,
      priority: ticket.priority,
      category: ticket.category,
      subject: ticket.subject,
      concern: ticket.message,
      contact: ticket.contact || 'Not provided',
      user_name: ticket.userName,
      user_id: ticket.userId || 'NA',
      company_code: ticket.companyCode || 'NA',
      branch_code: ticket.branchCode || 'NA',
      page_url: ticket.pageUrl,
      created_at: new Date(ticket.createdAt).toLocaleString(),
      attachment_note: ticket.attachmentCount ? `${ticket.attachmentCount} file(s) attached` : 'None'
    };

    return from(emailjs.send(this.ejs.serviceId, this.ejs.templateId, templateParams));
  }

  private fallbackToBackend(ticket: SosTicket, files: File[]): Observable<any> {
    this.updateTicketStatus(ticket.id, 'Pending Backend');
    return this.submitToBackend(ticket, files).pipe(
      catchError(error => {
        this.updateTicketStatus(ticket.id, 'Pending Backend');
        return throwError(() => error);
      })
    );
  }

  private submitToBackend(ticket: SosTicket, files: File[]): Observable<any> {
    const apiBase = sessionStorage.getItem('apiURL') || '';
    const fullUrl = apiBase + this.apiPath;

    const send$ = files.length > 0
      ? this.submitWithFormData(fullUrl, ticket, files)
      : this.commonService.postAPI(this.apiPath, this.buildJsonPayload(ticket));

    return send$.pipe(
      timeout(files.length > 0 ? 45000 : 15000),
      tap(() => this.updateTicketStatus(ticket.id, 'Submitted')),
      catchError(error => {
        this.updateTicketStatus(ticket.id, 'Pending Backend');
        return throwError(() => error);
      })
    );
  }

  private submitWithFormData(fullUrl: string, ticket: SosTicket, files: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('ticket', JSON.stringify(this.buildJsonPayload(ticket)));
    files.forEach((file, i) => formData.append(`attachment_${i}`, file, file.name));
    return this.http.post(fullUrl, formData);
  }

  private buildJsonPayload(ticket: SosTicket): object {
    return {
      ticketId: ticket.id,
      createdAt: ticket.createdAt,
      status: ticket.status,
      category: ticket.category,
      priority: ticket.priority,
      subject: ticket.subject,
      concern: ticket.message,
      contact: ticket.contact,
      pageUrl: ticket.pageUrl,
      userName: ticket.userName,
      userId: ticket.userId,
      companyCode: ticket.companyCode,
      branchCode: ticket.branchCode,
      sendTo: this.defaultSupportEmail,
      toEmail: this.defaultSupportEmail,
      supportEmail: this.defaultSupportEmail,
      recipientEmail: this.defaultSupportEmail,
      emailSubject: `[${ticket.priority}] ERP SOS Ticket ${ticket.id}: ${ticket.subject}`,
      emailBody: this.formatEmailBody(ticket)
    };
  }

  buildMailtoLink(ticket: SosTicket): string {
    const subject = encodeURIComponent(`[${ticket.priority}] ERP SOS Ticket ${ticket.id}: ${ticket.subject}`);
    const body = encodeURIComponent(this.formatEmailBody(ticket));
    return `mailto:${this.defaultSupportEmail}?subject=${subject}&body=${body}`;
  }

  getTickets(): SosTicket[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) as SosTicket[] : [];
    } catch {
      return [];
    }
  }

  updateTicketStatus(ticketId: string, status: SosTicket['status']): void {
    const tickets = this.getTickets().map(ticket =>
      ticket.id === ticketId ? { ...ticket, status, lastAttemptAt: new Date().toISOString() } : ticket
    );
    localStorage.setItem(this.storageKey, JSON.stringify(tickets));
  }

  markSolved(ticketId: string): void {
    this.updateTicketStatus(ticketId, 'Solved');
  }

  removeTicket(ticketId: string): void {
    const tickets = this.getTickets().filter(t => t.id !== ticketId);
    localStorage.setItem(this.storageKey, JSON.stringify(tickets));
  }

  clearAllTickets(): void {
    localStorage.removeItem(this.storageKey);
  }

  private saveTicket(ticket: SosTicket): void {
    const tickets = [ticket, ...this.getTickets()].slice(0, 50);
    localStorage.setItem(this.storageKey, JSON.stringify(tickets));
  }

  private createTicketId(): string {
    const now = new Date();
    const stamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ].join('');
    return `SOS-${stamp}-${Math.floor(Math.random() * 900 + 100)}`;
  }

  private formatEmailBody(ticket: SosTicket): string {
    return [
      `Ticket ID: ${ticket.id}`,
      `Created: ${new Date(ticket.createdAt).toLocaleString()}`,
      `Priority: ${ticket.priority}`,
      `Category: ${ticket.category}`,
      `Subject: ${ticket.subject}`,
      '',
      'Concern:',
      ticket.message,
      '',
      'Contact:',
      ticket.contact || 'Not provided',
      '',
      ticket.attachmentCount ? `Attachments: ${ticket.attachmentCount} file(s) attached` : '',
      '',
      'User Context:',
      `User: ${ticket.userName}`,
      `User ID: ${ticket.userId || 'NA'}`,
      `Company Code: ${ticket.companyCode || 'NA'}`,
      `Branch Code: ${ticket.branchCode || 'NA'}`,
      `Page URL: ${ticket.pageUrl}`
    ].filter(Boolean).join('\n');
  }
}
