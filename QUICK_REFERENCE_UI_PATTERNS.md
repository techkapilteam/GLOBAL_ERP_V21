# UI Pattern Standardization - Quick Reference Guide

## Reference File
**general-receipt-new.html** - Use this as the gold standard for all pattern implementations

---

## QUICK COPY-PASTE TEMPLATES

### 1. Modern Form Group Template
```html
<div class="erp-form-group">
  <label class="erp-label" for="fieldId">Field Label <span class="required">*</span></label>
  <input 
    type="text" 
    id="fieldId"
    class="erp-input" 
    formControlName="fieldName"
    [ngClass]="{ 'ng-invalid': getValidationMsg('fieldName') }">
  <app-validation-message [messgae]="getValidationMsg('fieldName')"></app-validation-message>
</div>
```

### 2. ERP Radio Button Group Template
```html
<div class="px-4 py-2">
  <h3 class="section-title mb-2">Section Title</h3>
  <div class="erp-radio-button-group">
    <label class="erp-radio-button">
      <input type="radio" formControlName="fieldName" value="VALUE1">
      <span class="button-label">Display Text 1</span>
    </label>
    <label class="erp-radio-button">
      <input type="radio" formControlName="fieldName" value="VALUE2">
      <span class="button-label">Display Text 2</span>
    </label>
  </div>
  <app-validation-message [messgae]="getValidationMsg('fieldName')"></app-validation-message>
</div>
```

### 3. ERP Dropdown with ng-select Template
```html
<div class="erp-form-group">
  <label class="erp-label">Dropdown Label <span class="required">*</span></label>
  <div class="erp-input-wrap">
    <ng-select
      [items]="itemList()"
      bindLabel="labelProperty"
      bindValue="valueProperty"
      formControlName="fieldName"
      placeholder="Select"
      (change)="onChangeHandler($event)"
      [ngClass]="{'ng-invalid': getValidationMsg('fieldName')}">
    </ng-select>
  </div>
  @if (getValidationMsg('fieldName')) {
    <div class="erp-field-error">Error message</div>
  }
</div>
```

### 4. ERP Button Variants
```html
<!-- Primary Button (Large) -->
<button class="erp-btn btn-primary btn-lg">Action</button>

<!-- Primary Button (Small) -->
<button class="erp-btn btn-primary btn-sm">Action</button>

<!-- Secondary Button -->
<button class="erp-btn btn-secondary">Cancel</button>

<!-- White/Ghost Button -->
<a routerLink="/path" class="erp-btn btn-white btn-sm">
  <i class="pi pi-list"></i> View
</a>

<!-- Icon-Only Button -->
<button class="erp-btn btn-outline btn-sm btn-icon" title="Edit">
  <i class="pi pi-pencil"></i>
</button>
```

### 5. Card Layout Template
```html
<div class="module-page">
  <div class="erp-card">
    <div class="card-header">
      <h2 class="card-title"><i class="pi pi-icon"></i> Page Title</h2>
      <span class="erp-spacer"></span>
      <a class="erp-btn btn-white btn-sm"><i class="pi pi-list"></i> View</a>
    </div>
    
    <form [formGroup]="form">
      <!-- Form Content -->
      <div class="p-4">
        <div class="row g-2">
          <div class="col-12 col-md-6">
            <!-- Form fields -->
          </div>
        </div>
      </div>
      
      <!-- Section -->
      <div class="px-4 py-2">
        <h3 class="section-title mb-2">Section Title</h3>
        <!-- Section content -->
      </div>
    </form>
  </div>
</div>
```

---

## SPACING QUICK REFERENCE

| Class | Value | Use Case |
|-------|-------|----------|
| `p-4` | 16px all | Card body padding |
| `px-4` | 16px left/right | Horizontal padding on sections |
| `py-2` | 8px top/bottom | Minimal vertical padding |
| `py-3` | 12px top/bottom | Medium vertical padding |
| `mb-2` | 8px bottom | Between form groups |
| `mb-3` | 12px bottom | Between sections |
| `mb-4` | 16px bottom | Large spacing |
| `g-2` | 8px gap | Tight column spacing |
| `g-3` | 12px gap | Comfortable column spacing |

---

## CLASS MIGRATION CHEATSHEET

### Form Classes
```
.form-group       → .erp-form-group
.form-label       → .erp-label
.form-control     → .erp-input
.form-select      → .erp-input (use on <select>)
.is-invalid       → .ng-invalid
.field-error      → .erp-field-error
```

### Button Classes
```
.btn              → .erp-btn
.btn-primary      → .btn-primary (keep with erp-btn)
.btn-secondary    → .btn-secondary (keep with erp-btn)
.btn-sm           → .btn-sm (keep with erp-btn)
.btn-lg           → .btn-lg (keep with erp-btn)
.btn-white        → .btn-white (new pattern)
.btn-outline      → .btn-outline (new pattern)
.btn-icon         → .btn-icon (icon-only button)
```

### Radio Classes
```
.erp-radio-group   → .erp-radio-button-group
.erp-radio         → .erp-radio-button
(add)              → .button-label (span inside label)
```

### Container Classes
```
.cm-container      → .module-page
.cm-card           → .erp-card
.cm-page-header    → .card-header
.screen-container  → .module-page
.screen-card       → .erp-card
.screen-header     → .card-header
.cm-form-group     → .erp-form-group
.cm-label          → .erp-label
```

---

## VALIDATION PATTERNS

### Using Component
```html
<app-validation-message 
  [messgae]="getValidationMsg('fieldName')">
</app-validation-message>
```

### Using Inline Error
```html
@if (getValidationMsg('fieldName')) {
  <div class="erp-field-error">{{ getValidationMsg('fieldName') }}</div>
}
```

### Setting Invalid State
```html
[ngClass]="{ 'ng-invalid': getValidationMsg('fieldName') }"
```

---

## DROPDOWN PATTERNS

### ng-select (Recommended)
```html
<ng-select
  [items]="dataList()"
  bindLabel="displayField"
  bindValue="valueField"
  formControlName="fieldName"
  placeholder="Select">
</ng-select>
```

### Native Select (Only for simple cases)
```html
<select class="erp-input" formControlName="fieldName">
  <option value="">Select</option>
  @for (item of items; track item.id) {
    <option [value]="item.id">{{ item.name }}</option>
  }
</select>
```

---

## DATE INPUT PATTERN

```html
<div class="erp-form-group">
  <label class="erp-label">Date <span class="required">*</span></label>
  <div class="erp-input-wrap erp-date-wrap">
    <i class="pi pi-calendar erp-input-icon"></i>
    <input 
      type="text"
      class="erp-input icon-pad"
      formControlName="dateField"
      bsDatepicker
      [bsConfig]="dpConfig"
      readonly>
  </div>
</div>
```

---

## FORM ACTION BUTTONS PATTERN

```html
<div class="form-actions">
  <button type="button" class="erp-btn btn-secondary" (click)="clear()">
    Clear
  </button>
  <button type="button" class="erp-btn btn-primary" (click)="save()">
    Save
  </button>
</div>
```

---

## GRID WITH ADD/DELETE BUTTONS

```html
<div class="p-4">
  <div class="erp-grid-controls mb-2">
    <button class="erp-btn btn-secondary btn-sm" (click)="clearRow()">Clear</button>
    <button class="erp-btn btn-primary btn-sm" (click)="addRow()">+ Add</button>
  </div>
  
  <!-- Table/Grid here -->
  
  <div class="grid-actions">
    <button pButton icon="pi pi-times" class="p-button-text p-button-sm p-button-danger"
            (click)="deleteRow(index)"></button>
  </div>
</div>
```

---

## SECTION WITH CONDITIONAL CONTENT

```html
<div class="px-4 py-2">
  <h3 class="section-title mb-2">Section Title</h3>
  @if (showSection()) {
    <div class="row g-2 mt-2">
      <div class="col-12 col-md-6">
        <!-- Form fields -->
      </div>
    </div>
  }
</div>
```

---

## COMMON PATTERNS IN general-receipt-new.html

1. **Alert Box**
   ```html
   @if (showAlert()) {
     <div class="erp-alert alert-warning" role="alert">
       <div class="alert-icon"><i class="pi pi-exclamation-triangle"></i></div>
       <div class="alert-body">
         <div class="alert-title">Title</div>
         <div class="alert-msg">Message</div>
       </div>
     </div>
   }
   ```

2. **Grid/Table Row**
   ```html
   <td>{{ data.field }}</td>
   <td>
     <button pButton icon="pi pi-times" class="p-button-text p-button-sm p-button-danger"></button>
   </td>
   ```

3. **Currency Display**
   ```html
   <span>{{ currencySymbol }} {{ amount }}</span>
   ```

---

## ICON CLASSES (PrimeIcons)

Common icons used in the app:
- `.pi pi-plus` - Plus/Add
- `.pi pi-list` - List/View
- `.pi pi-file-edit` - Edit/New
- `.pi pi-calendar` - Calendar/Date
- `.pi pi-times` - Close/Delete
- `.pi pi-pencil` - Edit
- `.pi pi-trash` - Delete
- `.pi pi-check` - Confirm
- `.pi pi-arrow-down` - Download
- `.pi pi-upload` - Upload
- `.pi pi-print` - Print
- `.pi pi-download` - Export
- `.pi pi-home` - Home
- `.pi pi-exclamation-triangle` - Warning

---

## RESPONSIVENESS GRID

```html
<!-- 1 column (mobile), 2 columns (tablet+) -->
<div class="col-12 col-md-6">

<!-- 1 column (mobile), 3 columns (tablet+) -->
<div class="col-12 col-md-4">

<!-- 1 column (mobile), 4 columns (tablet+) -->
<div class="col-12 col-md-3">

<!-- Full width -->
<div class="col-12">
```

---

## TESTING CHECKLIST

After migrating a file:
- [ ] All form groups use `.erp-form-group`
- [ ] All labels use `.erp-label`
- [ ] All text inputs use `.erp-input`
- [ ] All selects use `ng-select`
- [ ] All radio buttons use `.erp-radio-button-group` + `.erp-radio-button`
- [ ] All buttons use `.erp-btn` with appropriate variant
- [ ] All spacing uses `p-4`, `px-4`, `py-2`, `g-2`, `g-3`
- [ ] All validation uses `app-validation-message` or `.erp-field-error`
- [ ] Section titles use `.section-title`
- [ ] Card follows `.module-page` > `.erp-card` > `.card-header` pattern
- [ ] All icons use `.pi pi-*` classes
- [ ] Component loads without console errors
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Form submission works correctly
- [ ] Validation messages display correctly
- [ ] Buttons are clickable and functional

---

## COMMON MISTAKES TO AVOID

❌ **DON'T:**
- Mix `.form-group` and `.erp-form-group` in same file
- Use Bootstrap `.btn` with ERP `.erp-btn` together
- Use `<select>` when data is dynamic (use `ng-select` instead)
- Put validation message inside input element
- Use custom button classes like `.new-btn`, `.edit-btn`, `.btn-generate`
- Forget the `<span class="button-label">` in radio buttons
- Use `.screen-container` or `.cm-container` for new layouts
- Apply custom padding instead of utility classes (`p-4`, `px-4`, etc.)

✅ **DO:**
- Use `general-receipt-new.html` as reference for every pattern
- Standardize within a file first, then move to next file
- Use `px-4 py-2` for sections with titles
- Use `p-4` for main form container
- Wrap dropdowns in `.erp-input-wrap` for consistency
- Always include `app-validation-message` for form fields
- Use `.erp-spacer` in card headers to push buttons to right
- Use `<ng-select>` for all dynamic dropdowns
- Keep consistent spacing throughout the file
- Use Bootstrap grid classes (`col-12 col-md-6`) for layout

---

## FILE ORGANIZATION EXAMPLE

```html
<div class="module-page">                     <!-- Page wrapper -->

  <!-- Page Header with Breadcrumb -->
  <div class="d-flex justify-between align-center gap-4 mb-0">
    <div style="flex: 1;">
      <nav class="erp-breadcrumb">...</nav>
      <h1 class="page-title">...</h1>
    </div>
    <a class="erp-btn btn-white btn-sm">View</a>
  </div>

  <!-- Optional Alert -->
  @if (showAlert()) {
    <div class="erp-alert alert-warning">...</div>
  }

  <div class="erp-card">                      <!-- Main card -->
    
    <div class="card-header">                 <!-- Header section -->
      <h2 class="card-title">Title</h2>
      <span class="erp-spacer"></span>
      <a class="erp-btn btn-white btn-sm">Action</a>
    </div>

    <form [formGroup]="form">
      
      <!-- Date/Basic Fields Section -->
      <div class="p-4">                       <!-- Container: p-4 -->
        <div class="row g-2">
          <div class="col-12 col-md-6">      <!-- Responsive column -->
            <div class="erp-form-group">...
      
      <!-- Options/Radio Section -->
      <div class="px-4 py-2">                 <!-- Section: px-4 py-2 -->
        <h3 class="section-title mb-2">...</h3>
        <div class="erp-radio-button-group">...
      
      <!-- Detailed Fields Section -->
      <div class="px-4 py-2">
        <h3 class="section-title mb-2">...</h3>
        @if (showSection()) {
          <div class="row g-2 mt-2">
            <div class="col-12 col-md-6">
              <div class="erp-form-group">...
      
      <!-- Grid/Table Section -->
      <div class="p-4">
        <div class="grid-controls mb-2">
          <button class="erp-btn btn-secondary btn-sm">Clear</button>
          <button class="erp-btn btn-primary btn-sm">+ Add</button>
        </div>
        <!-- p-datatable here -->
      
      <!-- Form Action Buttons -->
      <div class="form-actions">
        <button class="erp-btn btn-secondary">Clear</button>
        <button class="erp-btn btn-primary">Save</button>
      </div>

    </form>
  </div>
</div>
```

---

## USEFUL COMMANDS

To find all instances of old patterns in a file:
```bash
grep -n "form-group\|form-control\|form-select\|form-label" filename.html
grep -n "\.btn " filename.html    # Bootstrap buttons
grep -n "cm-\|screen-" filename.html  # Custom containers
```

To count how many files need updating:
```bash
grep -r "form-group" src/app/features/ | wc -l
grep -r "screen-container" src/app/features/ | wc -l
```

---

## DOCUMENTATION LINKS (Internal)

- **Full Audit Report:** UI_PATTERN_AUDIT_REPORT.md
- **Reference File:** general-receipt-new.html
- **Common Component:** app-validation-message
- **Style Variables:** main-layout.component.scss (CSS variables)

