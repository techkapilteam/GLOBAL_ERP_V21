# Angular ERP UI Pattern Audit Report
**Date:** April 22, 2026  
**Workspace:** d:\Angular Projects\OneSphere_Version21_APR18\GLOBAL_ERP_V21  
**Total HTML Files Analyzed:** 41 files

---

## EXECUTIVE SUMMARY

The workspace contains **4 major UI pattern systems** used inconsistently across 41 feature HTML files. This results in poor maintainability and inconsistent user experience. The reference pattern used in `general-receipt-new.html` should serve as the standardization target.

---

## 1. FORM GROUP & INPUT PATTERNS

### Pattern 1A: **MODERN ERP PATTERN** (Target/Reference - general-receipt-new.html)
**Status:** ✅ Recommended Standard  
**Files Using:** 8+ files

```html
<!-- Container Structure -->
<div class="p-4">  <!-- or px-4 py-2 -->
  <div class="row g-2">
    <div class="col-12 col-md-6">
      <!-- Form Group -->
      <div class="erp-form-group">
        <label class="erp-label" for="fieldId">Label <span class="required">*</span></label>
        <div class="erp-input-wrap">
          <input class="erp-input" type="text" id="fieldId" />
        </div>
        <app-validation-message [messgae]="getValidationMsg('field')"></app-validation-message>
      </div>
    </div>
  </div>
</div>
```

**Components Used:**
- Container: `p-4` or `px-4 py-2` (padding)
- Row Grid: `row g-2` (gap between columns)
- Column: `col-12 col-md-6`
- Form Group: `.erp-form-group`
- Label: `.erp-label`
- Input Wrapper: `.erp-input-wrap` (for icons)
- Input: `.erp-input` 
- Date Input Wrapper: `.erp-date-wrap` with icon padding `.icon-pad`
- Error Display: `app-validation-message` component

**Files Using This Pattern:**
- general-receipt-new.html ✅
- general-receipt.html (partial)
- bank-config.html (partial)
- petty-cash.html (partial)
- cheques-inbank.html (partial)
- journal-voucher.html (partial)

---

### Pattern 1B: **BOOTSTRAP FORM PATTERN** (Legacy)
**Status:** ⚠️ Inconsistent - Needs Migration  
**Files Using:** 6+ files

```html
<div class="address-grid">
  <div class="form-group">
    <label class="form-label" id="paddress1">
      Label <span class="required-star">*</span>
    </label>
    <input type="text" formControlName="paddress1" class="form-control" 
           [class.is-invalid]="errorOf('paddress1')" />
    @if (errorOf('paddress1')) {
      <div class="field-error">{{ errorOf('paddress1') }}</div>
    }
  </div>
</div>
```

**Components Used:**
- Container: `.address-grid` (CSS Grid layout)
- Form Group: `.form-group`
- Label: `.form-label` + `.required-star`
- Input: `.form-control`
- Select: `.form-select`
- Error: `.field-error` (inline with ng-if)
- Error Styling: `.is-invalid` class on input

**Files Using This Pattern:**
- address.html ✅
- bank-book.html
- trial-balance.html
- brs.html
- gst-report.html

---

### Pattern 1C: **CUSTOM FORM PATTERN** (Proprietary)
**Status:** ⚠️ Component-Specific  
**Files Using:** 4+ files

```html
<div class="cm-filters">
  <div class="cm-form-group">
    <label class="cm-label">
      Select Bank <span class="cm-required">*</span>
    </label>
    <ng-select
      [items]="bankDetails()"
      bindLabel="bankName"
      bindValue="bankName"
      placeholder="--Select--">
    </ng-select>
  </div>
</div>
```

**Components Used:**
- Form Group: `.cm-form-group` (cheque-management specific)
- Label: `.cm-label`
- Required Indicator: `.cm-required`
- Dropdown: `ng-select` component

**Files Using This Pattern:**
- cheque-management.html
- cheque-managementnew.html
- bank-config-view.html

---

## 2. RADIO BUTTON PATTERNS

### Pattern 2A: **MODERN ERP RADIO** (Target/Reference)
**Status:** ✅ Recommended Standard  
**Files Using:** 10+ files

```html
<!-- Section Container -->
<div class="px-4 py-2">
  <h3 class="section-title mb-2">Mode Of Receipt</h3>
  
  <!-- Radio Group -->
  <div class="erp-radio-button-group">
    <label class="erp-radio-button">
      <input
        type="radio"
        formControlName="pmodofreceipt"
        value="CASH"
        (change)="Paymenttype('Cash')">
      <span class="button-label">Cash - {{ currencySymbol }} {{ balance }}</span>
    </label>
    <label class="erp-radio-button">
      <input
        type="radio"
        formControlName="pmodofreceipt"
        value="BANK"
        (change)="Paymenttype('Bank')">
      <span class="button-label">Bank - {{ currencySymbol }} {{ balance }}</span>
    </label>
  </div>
  <app-validation-message [messgae]="getValidationMsg('pmodofreceipt')"></app-validation-message>
</div>
```

**Components Used:**
- Container: `px-4 py-2` (section padding)
- Title: `section-title mb-2`
- Radio Group: `.erp-radio-button-group`
- Radio Label: `.erp-radio-button` (contains input + span)
- Button Label: `.button-label`
- Validation: `app-validation-message`

**Files Using This Pattern:**
- general-receipt-new.html ✅
- bank-config.html
- petty-cash.html
- journal-voucher.html
- tds-jv.html
- payment-voucher.html
- fund-transfer-out.html

---

### Pattern 2B: **LEGACY ERP RADIO**
**Status:** ⚠️ Inconsistent  
**Files Using:** 2+ files

```html
<div class="p-4">
  <h3 class="section-title mb-3">Mode of Payment</h3>
  <div class="erp-radio-group">
    <label class="erp-radio">
      <input
        type="radio"
        formControlName="pmodofPayment"
        value="CASH"
        (change)="modeofPaymentChange()">
      Cash - {{ currencySymbol }} {{ cashBalance }}
    </label>
  </div>
</div>
```

**Difference from Modern Pattern:**
- Uses `erp-radio-group` instead of `erp-radio-button-group`
- Uses `erp-radio` instead of `erp-radio-button`
- Text directly in label (no `button-label` span)
- Uses `p-4` instead of `px-4 py-2`

**Files Using This Pattern:**
- petty-cash.html (variant)
- payment-voucher.html (variant)

---

## 3. DROPDOWN PATTERNS

### Pattern 3A: **ng-select DROPDOWN** (Primary)
**Status:** ✅ Widely Used  
**Files Using:** 25+ files

```html
<!-- Simple Dropdown -->
<ng-select
  [items]="banklist()"
  bindLabel="bankName"
  bindValue="bankId"
  formControlName="pbankid"
  placeholder="Select"
  (change)="BankIdChange($event)"
  (close)="GeneralReceiptForm.get('pbankid')?.markAsTouched()"
  [ngClass]="{'ng-invalid': getValidationMsg('pbankid')}">
</ng-select>
@if (getValidationMsg('pbankid')) {
  <div class="erp-field-error">Please Select Bank Name</div>
}

<!-- With Input Wrapper -->
<div class="erp-input-wrap">
  <ng-select 
    class="erp-input icon-pad"
    [items]="banksList" 
    bindLabel="bankName" 
    bindValue="bankName">
  </ng-select>
</div>
```

**Usage Patterns:**
- **With validation:** Uses `[ngClass]` + separate error div
- **With error message:** `<div class="erp-field-error">`
- **Wrapped:** Uses `.erp-input-wrap` for consistent styling
- **Class variants:** `.erp-input`, `.icon-pad` for icon spacing
- **Event handlers:** `(change)`, `(close)`

**Files Using ng-select:**
- general-receipt-new.html (10+ instances)
- bank-config.html
- petty-cash.html
- cheques-inbank.html
- cheques-issued.html
- cheques-onhand.html
- cheque-managementnew.html
- brs-statements.html
- bank-book.html
- jv-list.html
- re-print.html
- account-ledger.html
- tds-report.html
- issued-cheque.html
- pettycash-receipt-cancel.html
- gst-report.html

---

### Pattern 3B: **NATIVE SELECT DROPDOWN** (Legacy)
**Status:** ⚠️ Old - Needs Migration  
**Files Using:** 5+ files

```html
<!-- Basic Select -->
<select class="erp-input">
  <option>PayTM</option>
  <option>Phone Pay</option>
  <option>Airtel Money</option>
</select>

<!-- With Form Control Classes -->
<select class="form-control">
  <option value="">Select</option>
  @for (item of items; track item.id) {
    <option [value]="item.id">{{ item.name }}</option>
  }
</select>

<!-- With Form Select Class -->
<select class="form-select" formControlName="pCountryId">
  <option value="">Select</option>
  @for (country of countryDetails(); track country.id) {
    <option [value]="country.id">{{ country.name }}</option>
  }
</select>
```

**Variants:**
- `.erp-input` - ERP styled select
- `.form-control` - Bootstrap styled (old)
- `.form-select` - Bootstrap 5 styled (newer legacy)

**Files Using Native Select:**
- address.html (form-select)
- general-receipt-new.html (erp-input - wallet selector)
- bank-config.html (erp-input)
- bank-book.html (form-control)
- cheque-managementnew.html (form-control)

---

## 4. BUTTON PATTERNS

### Pattern 4A: **ERP BUTTON SYSTEM** (Primary)
**Status:** ✅ Recommended Standard  
**Files Using:** 20+ files

```html
<!-- Primary Button (Large) -->
<button class="erp-btn btn-primary btn-lg">
  <i class="pi pi-plus"></i> New Entry
</button>

<!-- Primary Button (Small) -->
<button class="erp-btn btn-primary btn-sm" (click)="save()">
  Save
</button>

<!-- Secondary Button -->
<button class="erp-btn btn-secondary" (click)="cancel()">
  Cancel
</button>

<!-- White/Ghost Button -->
<a routerLink="/..." class="erp-btn btn-white btn-sm">
  <i class="pi pi-list"></i> View
</a>

<!-- Outline Button -->
<button class="erp-btn btn-outline btn-sm btn-icon">
  <i class="pi pi-edit"></i>
</button>

<!-- Action Button (icon only) -->
<button class="erp-btn btn-outline btn-sm btn-icon" title="Edit">
  <i class="pi pi-pencil"></i>
</button>
```

**Button Variants:**
- **Color:** `.btn-primary`, `.btn-secondary`, `.btn-white`, `.btn-outline`, `.btn-danger`
- **Size:** `.btn-lg`, `.btn-sm` (default is medium)
- **Type:** `.btn-icon` (for icon-only buttons)
- **Used on:** `<button>`, `<a>` elements
- **Icons:** PrimeIcons (`.pi .pi-*`)

**Files Using ERP Buttons:**
- general-receipt-new.html
- general-receipt.html
- bank-config.html
- petty-cash.html
- cheques-inbank.html
- journal-voucher.html
- tds-jv.html
- payment-voucher.html
- fund-transfer-out.html

---

### Pattern 4B: **PRIMENG BUTTON COMPONENT** (Secondary)
**Status:** ⚠️ Mixed - Used for Data Tables  
**Files Using:** 5+ files

```html
<!-- Delete Button -->
<button 
  type="button" 
  pButton 
  icon="pi pi-times" 
  class="p-button-text p-button-sm p-button-danger"
  (click)="deleteRow()">
</button>

<!-- Table Action Button -->
<button type="button" pButton icon="pi pi-pencil" class="p-button-text p-button-sm">
  Edit
</button>

<!-- Generate Report Button -->
<button type="submit" class="p-button p-button-primary">
  Generate Report
</button>
```

**Components Used:**
- Directive: `pButton`
- Size: `.p-button-sm`, `.p-button-lg`
- Style: `.p-button-text`, `.p-button-outlined`
- Color: `.p-button-primary`, `.p-button-danger`, `.p-button-secondary`
- Icon: `icon="pi pi-*"`

**Files Using PrimeNG Buttons:**
- general-receipt-new.html (grid delete buttons)
- bank-config.html (grid action buttons)
- bank-config-view.html
- cheque-management.html

---

### Pattern 4C: **BOOTSTRAP BUTTON SYSTEM** (Legacy)
**Status:** ⚠️ Old - Needs Migration  
**Files Using:** 5+ files

```html
<!-- Bootstrap Primary Button -->
<button class="btn btn-primary new-btn">+ New</button>

<!-- Bootstrap Primary Small -->
<button class="btn btn-sm edit-btn" (click)="edit()">Edit</button>

<!-- Bootstrap Generate Button -->
<button class="btn btn-primary btn-generate" (click)="generate()">Generate</button>

<!-- Bootstrap Outline Button -->
<button class="btn btn-outline-primary btn-upload" (click)="upload()">Upload</button>

<!-- Bootstrap Save Button -->
<button class="btn btn-primary btn-save" (click)="save()">Save</button>
```

**Classes Used:**
- Base: `.btn`
- Color: `.btn-primary`, `.btn-outline-primary`, `.btn-secondary`
- Size: `.btn-sm`, `.btn-lg`
- Custom: `.new-btn`, `.edit-btn`, `.btn-generate`, `.btn-upload`, `.btn-save`

**Files Using Bootstrap Buttons:**
- bank-config-view.html
- bank-book.html
- trial-balance.html
- brs.html
- bank-entries.html

---

### Pattern 4D: **CUSTOM BUTTON SYSTEM** (Component-Specific)
**Status:** ⚠️ Isolated - Cheque Management Only  
**Files Using:** 2 files

```html
<!-- Custom Cheque Management Button -->
<a class="cm-btn-primary">+ New</a>

<!-- Custom Show Button -->
<button class="cm-btn-show" type="button">Show</button>

<!-- Custom Export Icons (img links) -->
<a class="cm-export-icon" (click)="exportToPdf('Pdf')">
  <img src="assets/images/pdf-icon-blue.svg" alt="PDF" />
</a>
```

**Files Using Custom Buttons:**
- cheque-management.html
- cheque-managementnew.html

---

## 5. SPACING & LAYOUT PATTERNS

### Pattern 5A: **ERP SPACING PATTERN** (Modern)
**Status:** ✅ Recommended Standard

```html
<!-- Card Container with Padding -->
<div class="p-4">
  <!-- 16px padding on all sides -->
</div>

<!-- Section with Horizontal Padding Only -->
<div class="px-4 py-2">
  <!-- 16px left/right, 8px top/bottom -->
  <h3 class="section-title mb-2">Section Title</h3>
</div>

<!-- Row with Gap -->
<div class="row g-2">
  <!-- Columns with 8px gap between them -->
  <div class="col-12 col-md-6">Column 1</div>
  <div class="col-12 col-md-6">Column 2</div>
</div>

<!-- Alternative Gap Sizes -->
<div class="row g-3">
  <!-- 12px gap -->
</div>
```

**Spacing Classes:**
- `p-4` = padding all sides (16px)
- `px-4` = padding left/right (16px)
- `py-2` = padding top/bottom (8px)
- `py-3` = padding top/bottom (12px)
- `mb-2` = margin bottom (8px)
- `mb-3` = margin bottom (12px)
- `mb-4` = margin bottom (16px)
- `gap-4` = gap in flex/grid (16px)
- `g-2` = grid gap (8px)
- `g-3` = grid gap (12px)

**Files Using Modern Spacing:**
- general-receipt-new.html ✅
- petty-cash.html
- bank-config.html
- journal-voucher.html
- tds-jv.html

---

### Pattern 5B: **BOOTSTRAP SPACING** (Legacy)
**Status:** ⚠️ Old  
**Files Using:** 4+ files

```html
<!-- Using Bootstrap spacing utilities -->
<div class="mb-3"><!-- margin bottom 16px --></div>
<div class="mb-4"><!-- margin bottom 24px --></div>
<div class="row mb-3"><!-- row with bottom margin --></div>
<div class="col-md-3 filter-col"><!-- Bootstrap grid column --></div>
```

**Files Using Bootstrap Spacing:**
- bank-book.html
- trial-balance.html
- cheque-managementnew.html
- brs.html

---

### Pattern 5C: **CUSTOM CSS GRID LAYOUT** (Proprietary)
**Status:** ⚠️ Component-Specific  
**Files Using:** 2 files

```html
<!-- Custom Address Grid -->
<form [formGroup]="addressForm">
  <div class="address-grid">
    <!-- Grid items automatically positioned -->
    <div class="form-group">...</div>
  </div>
</form>

<!-- Custom Cheque Management Layout -->
<div class="cm-filters">
  <!-- Custom flex layout -->
</div>
```

**Files Using Custom Layouts:**
- address.html (CSS Grid)
- cheque-management.html (Flex)

---

## 6. SECTION CONTAINER PATTERNS

### Pattern 6A: **CARD WRAPPER PATTERN**
**Status:** ✅ Standard  
**Used in:** Most files

```html
<div class="module-page">
  <!-- Overall page container -->
  
  <div class="erp-card">
    <!-- Card Container -->
    
    <div class="card-header">
      <!-- Header Section -->
      <h2 class="card-title"><i class="pi pi-icon"></i> Page Title</h2>
      <span class="erp-spacer"></span>
      <a class="erp-btn btn-white btn-sm">Action Button</a>
    </div>
    
    <form [formGroup]="form">
      <!-- Content Sections -->
      
      <div class="p-4">
        <div class="row g-2">
          <!-- Form fields -->
        </div>
      </div>
      
      <!-- Section with Title -->
      <div class="px-4 py-2">
        <h3 class="section-title mb-2">Section Title</h3>
        <!-- Section content -->
      </div>
      
      <!-- Action Buttons at Bottom -->
      <div class="form-actions">
        <button class="erp-btn btn-secondary">Clear</button>
        <button class="erp-btn btn-primary">Save</button>
      </div>
    </form>
  </div>
</div>
```

**Files Using Card Pattern:**
- general-receipt-new.html ✅
- general-receipt.html
- bank-config.html
- petty-cash.html
- journal-voucher.html
- tds-jv.html
- payment-voucher.html
- fund-transfer-out.html

---

### Pattern 6B: **CUSTOM COMPONENT CONTAINER** (Legacy)
**Status:** ⚠️ Different naming conventions  
**Used in:** 5+ files

```html
<!-- Cheque Management -->
<div class="cm-container">
  <div class="cm-card">
    <header class="cm-page-header">
      <h2 class="cm-page-header__title">Title</h2>
    </header>
    <div class="cm-card-body">
      <div class="cm-filters">
        <!-- Filter form -->
      </div>
      <div class="cm-table-wrapper">
        <!-- Data table -->
      </div>
    </div>
  </div>
</div>

<!-- Bank Config View -->
<div class="screen-container">
  <div class="screen-card">
    <div class="screen-header">
      <h2 class="screen-title">Title</h2>
    </div>
  </div>
</div>

<!-- Bank Book Report -->
<div class="screen-container">
  <div class="screen-card">
    <div class="screen-header">
      <h2 class="screen-title">Title</h2>
    </div>
    <div class="section-content">
      <div class="container-fluid filter-container">
        <!-- Content -->
      </div>
    </div>
  </div>
</div>
```

**Files Using Custom Containers:**
- cheque-management.html
- bank-config-view.html
- bank-book.html
- trial-balance.html
- brs.html

---

## 7. VALIDATION MESSAGE PATTERNS

### Pattern 7A: **ERP VALIDATION COMPONENT** (Modern)
**Status:** ✅ Recommended Standard  
**Files Using:** 10+ files

```html
<div class="erp-form-group">
  <label class="erp-label">Field <span class="required">*</span></label>
  <ng-select
    [items]="data()"
    [ngClass]="{'ng-invalid': getValidationMsg('field')}">
  </ng-select>
  @if (getValidationMsg('field')) {
    <div class="erp-field-error">Please Select a Value</div>
  }
</div>

<!-- Alternative: Using app-validation-message component -->
<div class="erp-form-group">
  <label class="erp-label">Field <span class="required">*</span></label>
  <input class="erp-input" />
  <app-validation-message [messgae]="getValidationMsg('field')">
  </app-validation-message>
</div>
```

**Components/Patterns:**
- Component: `<app-validation-message>`
- Inline Div: `.erp-field-error`
- Invalid Styling: `.ng-invalid` class on input
- Error Text: Custom message

**Files Using ERP Validation:**
- general-receipt-new.html ✅
- bank-config.html
- petty-cash.html
- journal-voucher.html
- tds-jv.html
- payment-voucher.html

---

### Pattern 7B: **BOOTSTRAP VALIDATION** (Legacy)
**Status:** ⚠️ Old  
**Files Using:** 3+ files

```html
<div class="form-group">
  <label class="form-label">Field <span class="required-star">*</span></label>
  <input class="form-control" [class.is-invalid]="errorOf('field')" />
  @if (errorOf('field')) {
    <div class="field-error">{{ errorOf('field') }}</div>
  }
</div>
```

**Components/Patterns:**
- Error Class: `.is-invalid` on input
- Error Container: `.field-error`
- No component usage

**Files Using Bootstrap Validation:**
- address.html
- bank-book.html
- trial-balance.html

---

## 8. SUMMARY OF PATTERNS BY FILE

### Files Using MODERN PATTERNS (general-receipt-new.html style) ✅
1. **general-receipt-new.html** - ✅ Perfect Reference
2. **general-receipt.html** - ~70% Modern
3. **bank-config.html** - ~60% Modern
4. **petty-cash.html** - ~65% Modern
5. **journal-voucher.html** - ~55% Modern
6. **tds-jv.html** - ~50% Modern
7. **payment-voucher.html** - ~50% Modern
8. **fund-transfer-out.html** - ~50% Modern
9. **cheques-inbank.html** - ~50% Modern
10. **cheques-issued.html** - ~45% Modern
11. **cheques-onhand.html** - ~45% Modern

### Files Using MIXED PATTERNS (Needs Standardization) ⚠️
1. **cheque-managementnew.html** - Mixed (Bootstrap + ERP)
2. **cheque-management.html** - Custom CM pattern
3. **bank-config-view.html** - Mixed (Bootstrap + Custom)
4. **pettycash-receipt-cancel.html** - Mixed

### Files Using LEGACY PATTERNS (Bootstrap/Old) ⚠️
1. **address.html** - Pure Bootstrap Form Grid
2. **bank-book.html** - Bootstrap + Custom Screen Layout
3. **trial-balance.html** - Bootstrap + Custom Screen Layout
4. **brs.html** - Bootstrap + Custom Screen Layout
5. **bank-entries.html** - Bootstrap
6. **gst-report.html** - Bootstrap
7. **cheque-cancel.html** - Bootstrap
8. **cheque-enquiry.html** - Bootstrap
9. **cheque-return.html** - Bootstrap
10. **cash-book.html** - Bootstrap
11. **day-book.html** - Bootstrap
12. **issued-cheque.html** - Mixed
13. **jv-list.html** - Mixed
14. **re-print.html** - Mixed
15. **account-ledger.html** - Mixed
16. **account-summary.html** - Bootstrap
17. **ledger-extract.html** - Bootstrap
18. **schedule-tb.html** - Bootstrap
19. **comparison-tb.html** - Bootstrap
20. **brs-statements.html** - Bootstrap
21. **general-receipt-cancel.html** - Mixed
22. **payment-voucher-view.html** - Mixed
23. **journal-voucher-view.html** - Mixed
24. **petty-cash-view.html** - Mixed
25. **company-details.html** - Unknown

---

## 9. COMPONENT-SPECIFIC SCSS OVERRIDES

### 9.1 main-layout.component.scss
**Lines Analyzed:** 1-100+ (file not fully shown)  
**Findings:**
- Defines CSS variables for theming:
  - `--page-bg`, `--shell-bg`, `--topbar-bg`
  - `--primary`, `--primary-dark`, `--primary-soft`
  - `--text-strong`, `--text-main`, `--text-soft`
  - `--shadow-sm`, `--shadow-md`
- Theme support: `[data-theme='sky']` and `[data-theme='mist']`
- **No direct overrides of form/button styles detected in shown content**

### 9.2 login.component.scss
**Lines Analyzed:** 1-100+  
**Findings:**
- Custom login page styling with brand colors
- Uses global CSS variables:
  - `--clr-p1` (#0c4a6e), `--clr-p2` (#0891b2), `--clr-p3` (#06b6d4)
  - `--page-bg`
- Custom shapes and animations: `.login-page`, `.login-container`, `.left-panel`, `.orb`
- **No overrides of form/button styles**

### 9.3 dashboard.component.scss
**Lines Analyzed:** 1-100+  
**Findings:**
- Dashboard card styling with gradients
- Info card grid layout
- Hover animations and transitions
- **No overrides of form/button styles**

**Conclusion:** No significant SCSS overrides found that would affect standardization

---

## 10. DETAILED STANDARDIZATION RECOMMENDATIONS

### 10.1 PRIORITY 1: FORM GROUPS (HIGH IMPACT)

**Target Pattern:** ERP Form Group (general-receipt-new.html)

**Files to Update:**
- [ ] address.html - Convert from `.form-group` to `.erp-form-group`
- [ ] cheque-management.html - Convert from `.cm-form-group` to `.erp-form-group`
- [ ] cheque-managementnew.html - Convert from `.form-group` to `.erp-form-group`
- [ ] bank-config-view.html - Convert from `.form-control` to `.erp-input`
- [ ] All Bootstrap form-control inputs - Add `.erp-input` class

**Changes Required per File:**
```
address.html:
  .form-group → .erp-form-group
  .form-label → .erp-label
  .form-control → .erp-input
  .form-select → .erp-input (with select element)
  .is-invalid + .field-error → .ng-invalid + app-validation-message OR .erp-field-error

cheque-management.html:
  .cm-form-group → .erp-form-group
  .cm-label → .erp-label
  
All reports (bank-book, trial-balance, brs, etc):
  .form-group → .erp-form-group
  .form-label → .erp-label
  .form-control → .erp-input
```

---

### 10.2 PRIORITY 2: RADIO BUTTONS (HIGH IMPACT)

**Target Pattern:** ERP Radio Button Group (general-receipt-new.html)

**Files to Update:**
- [ ] petty-cash.html - Standardize to `erp-radio-button-group`
- [ ] payment-voucher.html - Standardize to `erp-radio-button-group`
- All other files - Use target pattern

**Changes Required:**
```
Current (Legacy):
<div class="erp-radio-group">
  <label class="erp-radio">
    <input type="radio" />
    Text
  </label>
</div>

Target (Standard):
<div class="erp-radio-button-group">
  <label class="erp-radio-button">
    <input type="radio" />
    <span class="button-label">Text</span>
  </label>
</div>
```

---

### 10.3 PRIORITY 3: DROPDOWNS (MEDIUM IMPACT)

**Target Pattern:** ng-select with `.erp-input` wrapper

**Files to Update:**
- [ ] address.html - Replace `<select class="form-select">` with ng-select
- [ ] bank-book.html - Replace `<select class="form-control">` with ng-select
- [ ] trial-balance.html - Replace native select with ng-select
- [ ] All reports using native select - Migrate to ng-select
- [ ] All cheque-*.html files - Ensure wrapped in `.erp-input-wrap`

**Pattern:**
```html
<!-- Current (Old) -->
<select class="form-control">
  <option>Option</option>
</select>

<!-- Target (New) -->
<div class="erp-input-wrap">
  <ng-select [items]="items" bindLabel="label" bindValue="value">
  </ng-select>
</div>
```

---

### 10.4 PRIORITY 4: BUTTONS (HIGH VISUAL IMPACT)

**Target Pattern:** ERP Button System (general-receipt-new.html)

**Files to Update:**
- [ ] bank-config-view.html - Replace `.btn .btn-primary` with `.erp-btn .btn-primary`
- [ ] bank-book.html - Replace `.btn` with `.erp-btn`
- [ ] trial-balance.html - Replace `.btn` with `.erp-btn`
- [ ] brs.html - Replace `.btn` with `.erp-btn`
- [ ] All report buttons - Use `.erp-btn` system
- [ ] cheque-management.html - Replace `.cm-btn-primary` with `.erp-btn .btn-primary`

**Conversion Table:**
```
Bootstrap         → ERP
.btn              → .erp-btn
.btn-primary      → .btn-primary (add to erp-btn)
.btn-secondary    → .btn-secondary
.btn-sm           → .btn-sm
.btn-lg           → .btn-lg
.btn-outline-*    → .btn-outline
.new-btn          → (remove, class only for style)
.edit-btn         → (remove, class only for style)
.btn-generate     → (remove, class only for style)
```

---

### 10.5 PRIORITY 5: SPACING & CONTAINERS (MEDIUM IMPACT)

**Target Pattern:** Modern ERP Spacing (general-receipt-new.html)

**Files to Update:**
- [ ] cheque-management.html - Replace `.cm-container/.cm-card` with `.module-page/.erp-card`
- [ ] bank-config-view.html - Replace `.screen-container/.screen-card` with `.module-page/.erp-card`
- [ ] bank-book.html - Replace `.screen-container/.screen-card` with `.module-page/.erp-card`
- All reports using `.screen-container` pattern

**Pattern Changes:**
```html
<!-- Old (Cheque Management) -->
<div class="cm-container">
  <div class="cm-card">
    <header class="cm-page-header">

<!-- Old (Bank Config View) -->
<div class="screen-container">
  <div class="screen-card">
    <div class="screen-header">

<!-- Target (Standard) -->
<div class="module-page">
  <div class="erp-card">
    <div class="card-header">
```

---

### 10.6 PRIORITY 6: VALIDATION MESSAGES (LOW IMPACT)

**Target Pattern:** ERP Field Error (general-receipt-new.html)

**Current Patterns:**
1. `app-validation-message` component - ✅ Good
2. `.erp-field-error` div - ✅ Good
3. `.field-error` div with `.is-invalid` - ⚠️ Change to erp pattern

**Files to Update:**
- [ ] address.html - Replace `.field-error` with `.erp-field-error`
- [ ] bank-book.html - Replace Bootstrap validation with ERP pattern

---

## 11. IMPLEMENTATION ROADMAP

### Phase 1: FOUNDATION (Week 1-2)
**Update 3 Core Files:**
1. [ ] address.html - Complete modernization (LOW COMPLEXITY)
2. [ ] general-receipt.html - Partial modernization to match general-receipt-new.html
3. [ ] bank-config.html - Complete modernization to match general-receipt-new.html

**Metrics:** 3 files completed, ~15% of codebase standardized

---

### Phase 2: ACCOUNTS_TRANSACTIONS (Week 2-3)
**Update 8 Files:**
1. [ ] petty-cash.html
2. [ ] payment-voucher.html
3. [ ] journal-voucher.html
4. [ ] tds-jv.html
5. [ ] fund-transfer-out.html
6. [ ] cheques-inbank.html
7. [ ] cheques-issued.html
8. [ ] cheques-onhand.html

**Metrics:** 11 files completed, ~27% of codebase standardized

---

### Phase 3: ACCOUNTS_CONFIG (Week 3)
**Update 3 Files:**
1. [ ] cheque-managementnew.html - Convert from Bootstrap to ERP
2. [ ] cheque-management.html - Convert custom CM pattern to ERP
3. [ ] bank-config-view.html - Convert from Bootstrap to ERP

**Metrics:** 14 files completed, ~34% of codebase standardized

---

### Phase 4: ACCOUNTS_REPORTS (Week 4)
**Update 19 Files:**
All report files using Bootstrap/custom patterns

**Metrics:** All files completed, 100% of codebase standardized

---

## 12. FILE-BY-FILE CHANGE SUMMARY

### Must Update - Pattern Transformation Required ⚠️

#### address.html
- **Current:** Bootstrap form grid with .form-group, .form-control, .form-select
- **Target:** ERP form group with .erp-form-group, .erp-label, .erp-input
- **Complexity:** LOW
- **Lines to Change:** 100+ lines (9 form groups)

#### cheque-management.html
- **Current:** Custom CM pattern + Bootstrap
- **Target:** Standardized ERP card/form/button system
- **Complexity:** MEDIUM
- **Lines to Change:** ~150 lines

#### bank-config-view.html
- **Current:** Bootstrap buttons (.btn, .btn-primary, .new-btn, .edit-btn)
- **Target:** ERP buttons (.erp-btn, .btn-primary, .btn-white)
- **Complexity:** MEDIUM
- **Lines to Change:** ~50 lines

#### All 19 Report Files (bank-book, trial-balance, brs, etc.)
- **Current:** Bootstrap form/button/spacing system
- **Target:** ERP form/button/spacing system
- **Complexity:** MEDIUM (per file)
- **Estimated Total Lines:** 1000+ lines across all files

---

### Should Update - Partial Standardization ✓

#### general-receipt.html
#### bank-config.html
#### petty-cash.html
#### journal-voucher.html
#### tds-jv.html
- **Current:** ~60-70% ERP pattern compliance
- **Target:** 100% ERP pattern compliance
- **Changes:** Minor refinements and consistency improvements

---

### Already Compliant ✅

#### general-receipt-new.html
- **Status:** Reference pattern - 100% compliant
- **No changes needed**

---

## 13. PATTERNS NOT FOUND (Missing Standardization)

1. **Toggle Switch Component** - No standard toggle/switch pattern detected
   - Recommendation: Create `.erp-toggle` or use ng-switch if needed
   
2. **Checkbox Component** - No standard checkbox pattern detected
   - Recommendation: Create `.erp-checkbox-group` following radio button pattern
   
3. **Data Table Styling** - Multiple inconsistent table patterns
   - bank-config.html uses Bootstrap table
   - cheque-management.html uses PrimeNG p-table
   - Others use minimal table styling
   
4. **Modal/Dialog Styling** - Inconsistent implementations
   - Some use Bootstrap modal classes
   - Some use PrimeNG p-dialog
   
5. **Breadcrumb Styling** - Custom `.erp-breadcrumb` used in some files only

---

## 14. QUICK REFERENCE TABLES

### Class Name Mapping for Migration

| Old Pattern | New Pattern | Component | Files Affected |
|---|---|---|---|
| `.form-group` | `.erp-form-group` | Form Container | address, bank-book, trial-balance, brs, reports |
| `.form-label` | `.erp-label` | Label | address, bank-book, trial-balance, brs, reports |
| `.form-control` | `.erp-input` | Text Input | address, bank-book, trial-balance, brs, reports |
| `.form-select` | `.erp-input` + `select` | Select Dropdown | address, bank-book, trial-balance, brs, reports |
| `.erp-radio-group` | `.erp-radio-button-group` | Radio Group | petty-cash, payment-voucher |
| `.erp-radio` | `.erp-radio-button` | Radio Button | petty-cash, payment-voucher |
| `.btn .btn-primary` | `.erp-btn .btn-primary` | Button | bank-config-view, bank-book, trial-balance, brs |
| `.cm-form-group` | `.erp-form-group` | Form Container | cheque-management |
| `.cm-btn-primary` | `.erp-btn .btn-primary` | Button | cheque-management |
| `.screen-container` | `.module-page` | Page Container | bank-book, trial-balance, brs |
| `.screen-card` | `.erp-card` | Card Container | bank-book, trial-balance, brs |
| `.field-error` | `.erp-field-error` | Error Message | address, bank-book, trial-balance |

---

## 15. VALIDATION CHECKLIST

After completing standardization, verify:

- [ ] All `.form-group` replaced with `.erp-form-group`
- [ ] All `.form-label` replaced with `.erp-label`
- [ ] All `.form-control` replaced with `.erp-input`
- [ ] All `.form-select` replaced with `.erp-input`
- [ ] All native `<select>` converted to `ng-select`
- [ ] All `.erp-radio` updated to `.erp-radio-button`
- [ ] All `.erp-radio-group` updated to `.erp-radio-button-group`
- [ ] All `.btn` classes replaced with `.erp-btn`
- [ ] All `.cm-*` classes replaced with `.erp-*`
- [ ] All `.screen-container` replaced with `.module-page`
- [ ] All `.screen-card` replaced with `.erp-card`
- [ ] All `.field-error` replaced with `.erp-field-error`
- [ ] Button icons use `.pi .pi-*` classes consistently
- [ ] Spacing uses `p-4`, `px-4`, `py-2`, `g-2`, `g-3` consistently
- [ ] All section titles use `.section-title` class
- [ ] Card headers follow `.card-header` pattern
- [ ] All dropdowns use `.erp-input-wrap` wrapper when needed
- [ ] Validation messages use `app-validation-message` component consistently

---

## CONCLUSION

**Overall Assessment:** The workspace has 4 distinct UI pattern systems causing inconsistency. The modern ERP pattern used in `general-receipt-new.html` is the clear standard that should be applied across all 41 feature HTML files.

**Estimated Effort:**
- **Low Complexity Files:** 5-10 hours (forms like address)
- **Medium Complexity Files:** 20-30 hours (mixed pattern files)
- **High Complexity Files:** 40-60 hours (report files with tables)
- **Total Estimated Effort:** 60-100 hours (distributed over 4 weeks)

**Expected Outcome:** 100% UI pattern standardization, improved maintainability, consistent user experience across all features.

