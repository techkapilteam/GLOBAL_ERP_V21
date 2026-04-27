import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactAddComponent } from '../contact-add/contact-add.component';
import { NgSelectModule } from '@ng-select/ng-select';

export type ContactTab = 'Contacts' | 'Employees' | 'Referrals' | 'Suppliers' | 'Advocates' | 'Freelancer';
type ContactStatusFilter = 'Active' | 'Inactive';

export interface Contact {
  id: string;
  uid: string;
  name: string;
  relation: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  photo?: string;
  type: ContactTab;
}

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgSelectModule, ContactAddComponent],
  templateUrl: './contacts-list.component.html',
  styleUrl: './contacts-list.component.scss',
})
export class ContactsListComponent implements OnInit {
  tabs: ContactTab[] = ['Contacts', 'Employees', 'Referrals', 'Suppliers', 'Advocates', 'Freelancer'];
  statusOptions: ContactStatusFilter[] = ['Active', 'Inactive'];
  pageSizeOptions = [6, 8, 12, 16];

  activeTab = signal<ContactTab>('Contacts');
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = signal(8);
  showFilters = signal(false);
  uidFilter = signal('');
  phoneFilter = signal('');
  relationFilter = signal('');
  addressFilter = signal('');
  statusFilter = signal<ContactStatusFilter | null>(null);
  showAddForm = signal(false);
  editingContact = signal<Contact | null>(null);

  allContacts = signal<Contact[]>([
    { id: '1', uid: 'CNT2560669', name: 'Uatuser', relation: '', phone: '8466999824', address: '', status: 'Active', type: 'Contacts' },
    { id: '2', uid: 'CNT2560668', name: 'Test Jag Test', relation: 'S/o - Test', phone: '9290218040', address: 'Test,Boduppal,Boduppal,Hyderabad,Telangana', status: 'Active', type: 'Contacts' },
    { id: '3', uid: 'CNT2560667', name: 'Sdfsdfs', relation: 'S/o - Fsdfs', phone: '1313213213', address: 'Dsfgsd,Gsfd,Sfgdgs,Ambedkar Konaseema', status: 'Active', type: 'Contacts' },
    { id: '4', uid: 'CNT2560666', name: 'Abc', relation: 'S/o - Fdgfg', phone: '5465465465', address: 'Fdgd,Fdgdf,Sfgdgd,Ambedkar Konaseema', status: 'Active', type: 'Contacts' },
    { id: '5', uid: 'EMP1000001', name: 'Ravi Kumar', relation: 'S/o - Suresh Kumar', phone: '9876543210', address: 'Hyderabad, Telangana', status: 'Active', type: 'Employees' },
    { id: '6', uid: 'SUP2000001', name: 'Lakshmi Enterprises', relation: '', phone: '8800112233', address: 'Vijayawada, Andhra Pradesh', status: 'Active', type: 'Suppliers' },
    { id: '7', uid: 'REF3000001', name: 'Prasad Rao', relation: 'S/o - Rao', phone: '9911223344', address: 'Warangal, Telangana', status: 'Active', type: 'Referrals' },
    { id: '8', uid: 'ADV4000001', name: 'Mohan Gandavarapu', relation: '', phone: '8885220886', address: 'Pallipalem,Sangam,Duvvur,Nellore,AP', status: 'Active', type: 'Advocates' },
    { id: '9', uid: 'FRL5000001', name: 'Priya Sharma', relation: 'D/o - Sharma', phone: '7788996655', address: 'Secunderabad, Telangana', status: 'Active', type: 'Freelancer' },
  ]);

  filteredContacts = computed(() => {
    const q = this.normalize(this.searchQuery());
    const uid = this.normalize(this.uidFilter());
    const phone = this.normalize(this.phoneFilter());
    const relation = this.normalize(this.relationFilter());
    const address = this.normalize(this.addressFilter());
    const status = this.statusFilter();

    return this.allContacts().filter(c =>
      c.type === this.activeTab() &&
      (!status || c.status === status) &&
      (!q || this.matchesAny(c, q)) &&
      (!uid || this.normalize(c.uid).includes(uid)) &&
      (!phone || this.normalize(c.phone).includes(phone)) &&
      (!relation || this.normalize(c.relation).includes(relation)) &&
      (!address || this.normalize(c.address).includes(address))
    );
  });

  totalItems = computed(() => this.filteredContacts().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));
  rangeStart = computed(() => this.totalItems() === 0 ? 0 : ((this.currentPage() - 1) * this.pageSize()) + 1);
  rangeEnd = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));
  activeFilterCount = computed(() => {
    const filters = [
      this.searchQuery(),
      this.uidFilter(),
      this.phoneFilter(),
      this.relationFilter(),
      this.addressFilter(),
      this.statusFilter() || ''
    ];

    return filters.filter(value => String(value).trim().length > 0).length;
  });

  pagedContacts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredContacts().slice(start, start + this.pageSize());
  });

  ngOnInit() {}

  switchTab(tab: ContactTab) {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  onSearch() {
    this.currentPage.set(1);
  }

  toggleFilters() {
    this.showFilters.update(value => !value);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.uidFilter.set('');
    this.phoneFilter.set('');
    this.relationFilter.set('');
    this.addressFilter.set('');
    this.statusFilter.set(null);
    this.currentPage.set(1);
  }

  setPageSize(value: string | number) {
    const nextSize = Number(value);
    if (!Number.isNaN(nextSize) && nextSize > 0) {
      this.pageSize.set(nextSize);
      this.currentPage.set(1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  getTabCount(tab: ContactTab) {
    return this.allContacts().filter(contact => contact.type === tab).length;
  }

  getContactInitials(contact: Contact) {
    return contact.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'C';
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  openAddForm() {
    this.editingContact.set(null);
    this.showAddForm.set(true);
  }

  openEditForm(contact: Contact) {
    this.editingContact.set(contact);
    this.showAddForm.set(true);
  }

  onFormClose() {
    this.showAddForm.set(false);
    this.editingContact.set(null);
  }

  onFormSave(contact: Contact) {
    if (this.editingContact()) {
      this.allContacts.update(list =>
        list.map(c => c.id === contact.id ? contact : c)
      );
    } else {
      const newContact = { ...contact, id: Date.now().toString(), uid: `CNT${Date.now()}`.slice(0, 13), type: this.activeTab() };
      this.allContacts.update(list => [newContact, ...list]);
    }
    this.showAddForm.set(false);
    this.editingContact.set(null);
  }

  printList() {
    window.print();
  }

  private normalize(value: string | null | undefined): string {
    return (value || '').trim().toLowerCase();
  }

  private matchesAny(contact: Contact, query: string): boolean {
    return [
      contact.name,
      contact.uid,
      contact.phone,
      contact.relation,
      contact.address,
      contact.status
    ].some(value => this.normalize(value).includes(query));
  }
}
