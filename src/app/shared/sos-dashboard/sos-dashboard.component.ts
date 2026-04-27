import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SosTicket, SosTicketService } from '../sos-help/sos-ticket.service';

@Component({
  selector: 'app-sos-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ReactiveFormsModule, TableModule],
  templateUrl: './sos-dashboard.component.html',
  styleUrl: './sos-dashboard.component.scss'
})
export class SosDashboardComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ticketService = inject(SosTicketService);

  readonly tickets = signal<SosTicket[]>(this.ticketService.getTickets());
  readonly submitting = signal(false);
  readonly message = signal('');
  readonly statusFilter = signal('All');
  readonly priorityFilter = signal('All');
  readonly searchText = signal('');
  readonly fromDate = signal('');
  readonly toDate = signal('');

  readonly statuses = ['All', 'Open', 'Submitted', 'Pending Backend', 'Failed', 'Solved'];
  readonly priorities = ['All', 'High', 'Medium', 'Low'];
  readonly categories = ['Error / Bug', 'Data Issue', 'Report Issue', 'Access Issue', 'Other'];

  readonly form = this.fb.group({
    category: ['Error / Bug', Validators.required],
    priority: ['High', Validators.required],
    subject: ['', [Validators.required, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1200)]],
    contact: ['', Validators.maxLength(120)]
  });

  readonly filteredTickets = computed(() => {
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const search = this.searchText().trim().toLowerCase();
    const from = this.fromDate() ? new Date(`${this.fromDate()}T00:00:00`) : null;
    const to = this.toDate() ? new Date(`${this.toDate()}T23:59:59`) : null;

    return this.tickets()
      .filter(ticket => status === 'All' || ticket.status === status)
      .filter(ticket => priority === 'All' || ticket.priority === priority)
      .filter(ticket => {
        const created = new Date(ticket.createdAt);
        return (!from || created >= from) && (!to || created <= to);
      })
      .filter(ticket => {
        if (!search) return true;
        return [
          ticket.id,
          ticket.subject,
          ticket.message,
          ticket.category,
          ticket.status,
          ticket.priority
        ].some(value => String(value || '').toLowerCase().includes(search));
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  submitNewTicket(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const ticket = this.ticketService.createTicket({
      category: raw.category || 'Other',
      priority: raw.priority || 'Medium',
      subject: (raw.subject || '').trim(),
      message: (raw.message || '').trim(),
      contact: (raw.contact || '').trim()
    });

    this.submitTicket(ticket, true);
  }

  retry(ticket: SosTicket): void {
    this.submitTicket(ticket, false);
  }

  reraise(ticket: SosTicket): void {
    this.form.patchValue({
      category: ticket.category,
      priority: ticket.priority,
      subject: `Re: ${ticket.subject}`,
      message: `Earlier Ticket: ${ticket.id}\n\n${ticket.message}`,
      contact: ticket.contact
    });
    this.message.set(`Ticket ${ticket.id} copied into the new ticket form.`);
  }

  markSolved(ticket: SosTicket): void {
    this.ticketService.markSolved(ticket.id);
    this.refreshTickets();
    this.message.set(`Ticket ${ticket.id} marked as solved.`);
  }

  clearFilters(): void {
    this.statusFilter.set('All');
    this.priorityFilter.set('All');
    this.searchText.set('');
    this.fromDate.set('');
    this.toDate.set('');
  }

  refreshTickets(): void {
    this.tickets.set(this.ticketService.getTickets());
  }

  private submitTicket(ticket: SosTicket, resetForm: boolean): void {
    this.submitting.set(true);
    this.message.set('');

    this.ticketService.submitTicket(ticket).subscribe({
      next: () => {
        this.submitting.set(false);
        this.refreshTickets();
        this.message.set(`Ticket ${ticket.id} submitted to support.`);
        if (resetForm) {
          this.form.reset({
            category: 'Error / Bug',
            priority: 'High',
            subject: '',
            message: '',
            contact: ''
          });
        }
      },
      error: () => {
        this.submitting.set(false);
        this.refreshTickets();
        this.message.set(`Ticket ${ticket.id} saved. Backend confirmation is pending.`);
      }
    });
  }
}
