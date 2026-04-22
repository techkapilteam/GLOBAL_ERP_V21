# Accounts_Transactions Components - CSS Class Replacement Mapping

## Overview
This document provides a comprehensive mapping of custom CSS classes in 12 Accounts_Transactions HTML templates that need to be replaced with global design system classes.

---

## 1. TDS-JV.html
**File:** `src/app/features/accounts/Accounts_Transactions/tds-jv/tds-jv.html`

### Structure Classes
| Current Class | Global Design System Equivalent | Purpose | Notes |
|---|---|---|---|
| `screen-container` | `module-page` | Main page wrapper | Contains entire component |
| `screen-card` | `erp-card` | Card container | Primary content card |

### Header Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-header` | `card-header` | Header section |
| `screen-title` | `card-title` | Main title |

### Form Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `form-panel` | `erp-form-section` | Form container |
| `form-group` | `erp-form-group` | Individual form field group |
| `field-label` | `erp-label` | Form field labels |
| `field-input` | `erp-input` | Form input elements |

### Table Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `tbl-header` | `grid-header` | Table header cells |
| `tbl-cell` | `grid-cell` | Table body cells |
| `tbl-footer-row` | `grid-footer` | Table footer row |
| `tbl-footer-label` | `grid-footer-label` | Footer label cell |
| `tbl-footer-amount` | `grid-footer-amount` | Footer amount cell |
| `tbl-empty-msg` | `grid-empty` | Empty state message |
| `p-datatable-sm` | Keep (PrimeNG) | PrimeNG styling |
| `p-datatable-gridlines` | Keep (PrimeNG) | PrimeNG styling |

### Button Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `btn` | Keep | Base button class |
| `btn-primary` | Keep | Primary button |
| `btn-secondary` | Keep | Secondary button |
| `btn-action` | Keep | Action button variant |
| `btn-show` | `erp-btn-show` | Show/Display button |

### Other Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `empty-state-box` | `empty-state` | Empty state container |
| `export-icon` | `icon-export` | Export icon link |
| `narration-area` | `textarea-input` | Textarea for narration |
| `char-count-wrap` | `char-counter` | Character counter |
| `action-buttons` | `button-group` | Button group container |

### Icon Changes
- `<i class="fa fa-spin fa-spinner"></i>` → Keep as is (Font Awesome)
- `<img src="assets/images/icon-excel.svg" />` → Can replace with `<i class="pi pi-download"></i>` for consistency

---

## 2. CHEQUES-INBANK.html
**File:** `src/app/features/accounts/Accounts_Transactions/cheques-inbank/cheques-inbank.html`

### Structure Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `section-wrapper` | `module-page` | Main wrapper |
| `screen-header` | `card-header` | Header |
| `screen-title` | `card-title` | Title |
| `screen-content` | `card-body` | Content area |

### Filter & Layout Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `filter-row` | `filter-section` | Filter controls row |
| `col-md-*` | Keep (Bootstrap) | Grid columns |
| `form-group` | `erp-form-group` | Form group |
| `form-label` | `erp-label` | Form label |
| `form-control` | `erp-input` | Form control |
| `required-field` | `required-indicator` | Required field marker |
| `required-star` | `required-marker` | Red asterisk |

### Bank Balance Card Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `bank-balance-card` | `info-card` | Balance display card |
| `bank-balance-name` | `card-meta-label` | Bank name label |
| `bank-balance-title` | `card-title-sm` | "Cheques in Bank" title |
| `bank-balance-row` | `info-row` | Info display row |
| `balance-label` | `info-label` | Label |
| `balance-value` | `info-value` | Value |
| `brs-label` | `info-label` | BRS label |
| `brs-value` | `info-value` | BRS value |

### Search & Export Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `section-content--padded` | `section-padded` | Padded section |
| `search-wrapper` | `search-container` | Search input wrapper |
| `search-icon` | `search-icon` | Search icon |
| `search-input` | `erp-input-search` | Search input field |
| `export-icons` | `export-toolbar` | Export buttons container |
| `export-list` | Keep (List styling) | Export list |
| `export-icon` | `icon-export` | Individual export icon |

### Tab Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `nav` | Keep (Bootstrap) | Nav container |
| `status-tabs` | `tab-group` | Tab group |
| `nav-item` | `tab-item` | Tab item |
| `status-tab-link` | `tab-link` | Tab link |
| `active` | `active` | Active tab state |
| `badge` | `badge` | Badge element |
| `badge-warning` | `badge-warning` | Warning badge |
| `badge-secondary` | `badge-secondary` | Secondary badge |
| `badge-primary` | `badge-primary` | Primary badge |
| `badge-success` | `badge-success` | Success badge |
| `badge-danger` | `badge-danger` | Danger badge |

### BRS Date Range Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `brs-date-row` | `date-range-section` | BRS date range container |
| `brs-to-row` | `date-input-group` | Date input with button |
| `brs-validation-error` | `field-error` | Validation error message |

### Grid/Table Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `grid-container` | `table-container` | Table wrapper |
| `grid-th` | `grid-header` | Table header |
| `grid-th--checkbox` | `grid-header-checkbox` | Checkbox header |
| `cell-center` | `grid-cell-center` | Center aligned cell |
| `cell-left` | `grid-cell-left` | Left aligned cell |
| `cell-right` | `grid-cell-right` | Right aligned cell |
| `cell-muted` | `grid-cell-muted` | Muted cell |
| `grid-empty` | `grid-empty` | Empty state |
| `grid-footer-cell` | `grid-footer` | Footer cell |
| `grid-footer-total` | `grid-footer-amount` | Footer total |
| `p-datatable-sm` | Keep (PrimeNG) | PrimeNG styling |
| `p-datatable-gridlines` | Keep (PrimeNG) | PrimeNG styling |

### Button Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `btn` | Keep | Base button |
| `btn-primary` | Keep | Primary button |
| `btn-dark` | Keep | Dark button |
| `btn-sm` | Keep | Small button |
| `btn-search` | `erp-btn-search` | Search button |
| `btn-show` | `erp-btn-show` | Show button |
| `btn-action` | `erp-btn-action` | Action button |
| `btn-icon` | `btn-icon` | Icon button |

### Form/Input Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `form-control-sm` | `erp-input-sm` | Small input |
| `ref-input` | `erp-input` | Reference input |
| `is-invalid` | `is-invalid` | Invalid state |
| `ng-select-sm` | Keep (ng-select) | ng-select small |
| `validation-error` | `field-error` | Validation error |

### Modal Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `modal` | `modal-dialog` | Modal container |
| `modal-dialog--right` | `modal-right` | Right-aligned modal |
| `modal-content` | `modal-content` | Modal content |
| `modal-body` | `modal-body` | Modal body |
| `modal-close` | `modal-close-btn` | Close button |
| `modal-validation-error` | `field-error` | Error message |
| `modal-actions` | `modal-footer` | Action buttons |

---

## 3. FUND-TRANSFER-OUT.html
**File:** `src/app/features/accounts/Accounts_Transactions/fund-transfer-out/fund-transfer-out.html`

**Status:** Placeholder content - `<p>fund-transfer-out works!</p>`
**Action:** Once actual template is created, apply mappings from similar components (e.g., payment-voucher)

---

## 4. PAYMENT-VOUCHER.html
**File:** `src/app/features/accounts/Accounts_Transactions/payment-voucher/payment-voucher.html`

### Structure Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-container` | `module-page` | Main container |
| `pv-card` | `erp-card` | Card section |

### Header Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-header` | `card-header` | Header |
| `pv-header-title-group` | `header-group` | Title group |
| `pv-header-icon` | `header-icon` | Header icon |
| `pv-header-title` | `card-title` | Title |
| `pv-header-badge` | `badge` | Record count badge |

### Toolbar Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-toolbar` | `toolbar` | Toolbar container |
| `pv-btn-primary` | `erp-btn-primary` | Primary button |
| `pv-search` | `search-container` | Search container |
| `pv-search-icon` | `search-icon` | Search icon |
| `pv-search-input` | `erp-input-search` | Search input |
| `pv-search-clear` | `btn-close` | Clear button |

### Table Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-table-wrapper` | `table-container` | Table wrapper |
| `pv-skeleton` | `skeleton-loader` | Loading skeleton |
| `pv-skeleton-row` | `skeleton-row` | Skeleton row |
| `pv-datatable` | Keep (PrimeNG) | PrimeNG table |
| `pv-col-actions` | `grid-col-actions` | Actions column |
| `pv-col` | `grid-cell` | Regular cell |
| `pv-col-center` | `grid-cell-center` | Centered cell |
| `pv-col-right` | `grid-cell-right` | Right-aligned cell |

### Row/Cell Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-row` | `grid-row` | Table row |
| `pv-cell` | `grid-cell` | Cell |
| `pv-cell-actions` | `grid-cell-actions` | Actions cell |
| `pv-cell-center` | `grid-cell-center` | Centered cell |
| `pv-cell-right` | `grid-cell-right` | Right-aligned cell |

### Content Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-date` | `date-value` | Date display |
| `pv-date-icon` | `date-icon` | Calendar icon |
| `pv-voucher-id` | `id-value` | Voucher ID |
| `pv-amount` | `amount-value` | Amount display |

### Empty/Message Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-empty` | `grid-empty` | Empty cell |
| `pv-empty-icon` | `empty-icon` | Empty icon |
| `pv-empty-text` | `empty-text` | Empty message |
| `pv-empty-hint` | `empty-hint` | Empty hint |

### Tag/Badge Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `p-tag` | Keep (PrimeNG) | PrimeNG tag |

---

## 5. CHEQUES-ONHAND.html
**File:** `src/app/features/accounts/Accounts_Transactions/cheques-onhand/cheques-onhand.html`

### Structure Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-container` | `module-page` | Main page |
| `screen-card` | `erp-card` | Card container |

### Header Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-header` | `card-header` | Header |
| `header-title` | `card-title` | Title |

### Form Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `filter-row` | `filter-section` | Filter row |
| `filter-col` | Keep (Layout) | Filter column |
| `filter-col--sm` | `filter-col-small` | Small column |
| `filter-col--md` | `filter-col-medium` | Medium column |
| `filter-col--lg` | `filter-col-large` | Large column |
| `form-group` | `erp-form-group` | Form group |
| `form-label` | `erp-label` | Label |
| `form-control` | `erp-input` | Input control |
| `required-star` | `required-marker` | Required indicator |

### Balance Card Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `balance-card` | `info-card` | Balance card |
| `balance-bank-name` | `card-meta-label` | Bank name |
| `balance-divider` | `divider` | Divider |
| `balance-title` | `card-title-sm` | Title |
| `balance-info` | `info-section` | Info section |
| `balance-item` | `info-row` | Info item |
| `balance-value` | `info-value` | Value |

### Toolbar Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `toolbar-row` | `toolbar` | Toolbar |
| `search-wrapper` | `search-container` | Search |
| `search-box` | `search-input-group` | Search box |
| `search-icon` | `search-icon` | Icon |
| `search-input` | `erp-input-search` | Input |
| `export-icons` | `export-toolbar` | Export |
| `export-btn` | `icon-button` | Export button |

### Tab Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `nav-tabs-custom` | `tab-group` | Tab group |
| `nav-item-custom` | `tab-item` | Tab item |
| `nav-link-custom` | `tab-link` | Link |
| `active` | `active` | Active state |
| `badge` | `badge` | Badge |
| `badge--warning` | `badge-warning` | Warning |
| `badge--secondary` | `badge-secondary` | Secondary |
| `badge--primary` | `badge-primary` | Primary |
| `badge--success` | `badge-success` | Success |
| `badge--danger` | `badge-danger` | Danger |

### Date Range Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `brs-date-row` | `date-range-section` | Date range |
| `brs-date-col` | Keep (Layout) | Column |
| `brs-to-row` | `date-input-group` | Button group |
| `btn--primary` | Keep | Button |
| `btn--show` | `erp-btn-show` | Show button |
| `error-msg` | `field-error` | Error |

### Table Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `table-container` | `table-container` | Wrapper |
| `th-action` | `grid-header-action` | Action column |
| `th-cell` | `grid-header` | Header |
| `th-cell--right` | `grid-header-right` | Right-aligned |
| `td-action` | `grid-cell-action` | Action cell |
| `td-cell` | `grid-cell` | Cell |
| `td-center` | `grid-cell-center` | Centered |
| `td-right` | `grid-cell-right` | Right-aligned |
| `td-empty` | `grid-empty` | Empty |
| `td-total` | `grid-cell-amount` | Total |

### Control Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `form-control--sm` | `erp-input-sm` | Small input |
| `is-invalid` | `is-invalid` | Invalid |

### Button Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `btn` | Keep | Button |
| `btn--dark` | Keep | Dark |
| `btn--primary` | Keep | Primary |
| `action-bar` | `button-group` | Button group |

### Modal Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `modal` | `modal-dialog` | Modal |
| `modal-dialog--right` | `modal-right` | Right |
| `modal-content` | `modal-content` | Content |
| `modal-body` | `modal-body` | Body |
| `modal-close` | `modal-close-btn` | Close |
| `model-cst` | Remove (custom) | Custom class |
| `modal-footer-custom` | `modal-footer` | Footer |
| `form-control--right` | `text-right` | Right-aligned |

---

## 6. PETTY-CASH.html
**File:** `src/app/features/accounts/Accounts_Transactions/petty-cash/petty-cash.html`

### Structure Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-container` | `module-page` | Main container |
| `screen-card` | `erp-card` | Card |

### Header Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-header` | `card-header` | Header |
| `screen-title` | `card-title` | Title |
| `btn-view` | `erp-btn-view` | View button |

### Content Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-content` | `card-body` | Body |

### Section Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `section-card` | `form-section` | Section |
| `row` | Keep (Bootstrap) | Row |
| `col-md-*` | Keep (Bootstrap) | Columns |

### Form Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `form-group` | `erp-form-group` | Group |
| `form-label` | `erp-label` | Label |
| `required-label` | `required-label` | Required |
| `form-control` | `erp-input` | Input |
| `is-invalid` | `is-invalid` | Invalid |
| `form-error` | `field-error` | Error |
| `form-label-sm` | `erp-label-sm` | Small label |
| `form-check-input` | Keep (Bootstrap) | Checkbox |

### Radio/Pill Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `radio-group` | `radio-group` | Radio group |
| `radio-pill-label` | `radio-label` | Radio label |

### Panel/Box Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `instrument-panel` | `panel-section` | Panel |
| `balance-badges` | `badge-group` | Badge group |
| `balance-badge` | `info-badge` | Badge |
| `balance-badge--green` | `badge-success` | Green |
| `balance-badge--yellow` | `badge-warning` | Yellow |
| `balance-dot` | `badge-indicator` | Indicator dot |

### Field Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `field-balance-row` | `field-with-meta` | Field with meta |
| `field-flex` | Keep (Flexbox) | Flex container |
| `balance-hint` | `field-hint` | Hint text |

### Tax Section Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `tax-box` | `collapsible-section` | Tax section |
| `tax-box-header` | `section-header` | Header |
| `tax-box-label` | `section-label` | Label |
| `material-switch` | `toggle-switch` | Switch |
| `switch-disabled` | `disabled` | Disabled state |

### GST Cards Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `gst-cards-row` | `info-cards-row` | Cards row |
| `gst-mini-card` | `mini-card` | Mini card |
| `gst-card-label` | `card-label` | Label |
| `gst-card-value` | `card-value` | Value |

---

## 7. CHEQUES-ISSUED.html
**File:** `src/app/features/accounts/Accounts_Transactions/cheques-issued/cheques-issued.html`

### Structure Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-container` | `module-page` | Container |
| `screen-card` | `erp-card` | Card |

### Header Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-header` | `card-header` | Header |
| `header-title` | `card-title` | Title |

### Content Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-content` | `card-body` | Body |
| `section-content` | `form-section` | Section |

### Form Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `form-group` | `erp-form-group` | Group |
| `fw-bold` | `fw-bold` | Bold (Bootstrap) |
| `form-control` | `erp-input` | Input |
| `w-auto` | Keep | Width utility |
| `field-label` | `erp-label` | Label |
| `field-error` | `field-error` | Error |
| `is-invalid` | `is-invalid` | Invalid |

### Balance Card Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `balance-card` | `info-card` | Card |
| `balance-card__title` | `card-title-sm` | Title |
| `balance-box` | `info-section` | Box |

### Search Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `custom-search` | `search-container` | Search |
| `search-icon` | `search-icon` | Icon |
| `search-input` | `erp-input-search` | Input |
| `export-row` | `export-toolbar` | Export |
| `export-icons` | `icon-group` | Icons |

### Tab Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `custom-tabs` | `tab-group` | Tabs |
| `tab-btn` | `tab-link` | Button |
| `active-tab` | `active` | Active |
| `count` | `badge` | Badge |
| `blue` | `badge-primary` | Primary |
| `green` | `badge-success` | Success |
| `red` | `badge-danger` | Danger |
| `badge-blue` | `badge-primary` | Primary |

### BRS Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `brs-label` | `info-label` | Label |
| `brs-date-input` | `erp-input` | Input |
| `brs-error` | `field-error` | Error |
| `d-flex` | Keep (Bootstrap) | Flex |
| `align-items-center` | Keep (Bootstrap) | Align |
| `ms-3` | Keep (Bootstrap) | Margin |
| `btn-show` | `erp-btn-show` | Button |

### Table Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `table-card` | `table-container` | Container |
| `th-action` | `grid-header-action` | Action |
| `th-cell` | `grid-header` | Header |
| `th-right` | `grid-header-right` | Right |
| `td-center` | `grid-cell-center` | Center |
| `td-cell` | `grid-cell` | Cell |
| `td-right` | `grid-cell-right` | Right |
| `td-empty` | `grid-empty` | Empty |
| `td-link` | `grid-cell-link` | Link |

---

## 8. PETTYCASH-RECEIPT-CANCEL.html
**File:** `src/app/features/accounts/Accounts_Transactions/pettycash-receipt-cancel/pettycash-receipt-cancel.html`

### Structure Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `page-wrapper` | `module-page` | Wrapper |
| `screen-card` | `erp-card` | Card |

### Header Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-header` | `card-header` | Header |
| `header-accent` | `header-accent-line` | Accent |
| `header-title` | `card-title` | Title |

### Content Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-content` | `card-body` | Body |

### Section Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `section-card` | `form-section` | Section |
| `section-title` | `section-title` | Title |

### Form Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `form-group` | `erp-form-group` | Group |
| `field-label` | `erp-label` | Label |
| `required-star` | `required-marker` | Required |
| `form-control` | `erp-input` | Input |
| `is-invalid` | `is-invalid` | Invalid |
| `invalid-feedback` | `field-error` | Error |
| `textarea-control` | `textarea-input` | Textarea |

### Button Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `btn-show` | `erp-btn-show` | Show |
| `btn-icon` | Keep | Icon |

### Info Row Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `info-row` | `info-section` | Row |
| `info-left` | `info-left-section` | Left |
| `info-item` | `info-item` | Item |
| `info-label` | `info-label` | Label |
| `info-value` | `info-value` | Value |

### Table Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `table-header-cell` | `grid-header` | Header |
| `table-sno` | `grid-header-sno` | Serial |
| `table-amount` | `grid-header-amount` | Amount |
| `table-body-row` | `grid-row` | Row |
| `table-cell` | `grid-cell` | Cell |
| `table-cell-right` | `grid-cell-right` | Right |
| `table-empty` | `grid-empty` | Empty |
| `p-datatable-gridlines` | Keep (PrimeNG) | PrimeNG |
| `p-datatable-sm` | Keep (PrimeNG) | PrimeNG |

### Summary Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `total-row` | `summary-row` | Row |
| `total-label` | `summary-label` | Label |
| `total-value` | `summary-value` | Value |
| `summary-row` | `info-section` | Section |
| `summary-item` | `info-item` | Item |
| `summary-narration` | Keep | Narration |
| `narration-text` | Keep | Text |

### Footer Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `footer-actions` | `modal-footer` | Actions |
| `btn-cancel` | `btn-secondary` | Cancel |
| `btn-save` | `btn-primary` | Save |
| `btn-loading` | `loading-state` | Loading |

---

## 9. JOURNAL-VOUCHER-VIEW.html
**File:** `src/app/features/accounts/Accounts_Transactions/journal-voucher-view/journal-voucher-view.html`

### Structure Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-container` | `module-page` | Container |
| `screen-card` | `erp-card` | Card |

### Header Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-header` | `card-header` | Header |
| `screen-title` | `card-title` | Title |

### Body Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-body` | `card-body` | Body |

### Toolbar Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `toolbar-row` | `toolbar` | Toolbar |
| `btn-new` | `erp-btn-primary` | New button |
| `search-wrapper` | `search-container` | Search |
| `search-icon` | Keep (PrimeNG) | Icon |
| `search-input` | `erp-input-search` | Input |

### Table Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `table-card` | `table-container` | Container |
| `col-actions` | `grid-col-actions` | Actions |
| `col-date` | `grid-col-date` | Date |
| `col-jvno` | `grid-col-id` | JV No |
| `col-amount` | `grid-col-amount` | Amount |
| `col-narration` | `grid-col-text` | Narration |
| `th-base` | `grid-header` | Header |
| `th-sortable` | `grid-header-sortable` | Sortable |
| `sort-icon` | `sort-icon` | Icon |
| `td-center` | `grid-cell-center` | Center |
| `td-base` | `grid-cell` | Cell |
| `td-text` | `grid-cell-text` | Text |
| `td-right` | `grid-cell-right` | Right |
| `td-empty` | `grid-empty` | Empty |

### Button Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `btn-view` | `erp-btn-view` | View |
| `p-button-text` | Keep (PrimeNG) | PrimeNG |
| `p-button-sm` | Keep (PrimeNG) | PrimeNG |
| `p-button-primary` | Keep (PrimeNG) | PrimeNG |

---

## 10. GENERAL-RECEIPT-CANCEL.html
**File:** `src/app/features/accounts/Accounts_Transactions/general-receipt-cancel/general-receipt-cancel.html`

### Structure Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-container` | `module-page` | Container |
| `screen-card` | `erp-card` | Card |

### Header Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-header` | `card-header` | Header |
| `screen-title` | `card-title` | Title |

### Content Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-content` | `card-body` | Body |

### Section Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `section-card` | `form-section` | Section |
| `section-label` | `section-title` | Label |

### Form Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `form-group` | `erp-form-group` | Group |
| `field-label` | `erp-label` | Label |
| `required` | `required-marker` | Required |
| `input-readonly` | `erp-input-readonly` | Readonly |

### Button Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `btn-primary-action` | `erp-btn-primary` | Primary |
| `btn-full` | Keep | Full width |

### Meta/Info Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `receipt-meta` | `info-section` | Meta |
| `meta-item` | `info-item` | Item |
| `meta-key` | `info-label` | Label |
| `meta-value` | `info-value` | Value |

### Table Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `table-header` | `grid-header` | Header |
| `table-header-sno` | `grid-header-sno` | Serial |
| `table-header-amount` | `grid-header-amount` | Amount |
| `table-cell` | `grid-cell` | Cell |
| `table-cell-amount` | `grid-cell-amount` | Amount |
| `table-empty` | `grid-empty` | Empty |
| `p-datatable-gridlines` | Keep (PrimeNG) | PrimeNG |
| `p-datatable-sm` | Keep (PrimeNG) | PrimeNG |

### Summary Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `summary-row` | `info-section` | Section |
| `summary-item` | `info-item` | Item |
| `narration-value` | `info-value` | Value |

### Total Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `total-amount-row` | `summary-row` | Row |
| `total-label` | `summary-label` | Label |
| `total-value` | `summary-value` | Value |

### Footer Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `footer-actions` | `modal-footer` | Actions |
| `btn-secondary-action` | `btn-secondary` | Secondary |
| `btn-primary-action` | `btn-primary` | Primary |

---

## 11. PAYMENT-VOUCHER-VIEW.html
**File:** `src/app/features/accounts/Accounts_Transactions/payment-voucher-view/payment-voucher-view.html`

### Structure Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-screen` | `module-page` | Screen |
| `pv-shell` | `card-wrapper` | Wrapper |

### Header Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-header` | `card-header` | Header |
| `pv-header__title` | `card-title` | Title |
| `pv-header__spacer` | Keep | Spacer |
| `pv-header__view-btn` | `erp-btn-view` | View |

### Body Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-body` | `card-body` | Body |

### Card/Form Sections
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-card` | `form-section` | Section |
| `pv-card__title` | `section-title` | Title |

### Label/Input Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-label` | `erp-label` | Label |
| `pv-label__required` | `required-marker` | Required |
| `pv-input` | `erp-input` | Input |
| `pv-input--invalid` | `is-invalid` | Invalid |
| `pv-input--readonly` | `erp-input-readonly` | Readonly |
| `pv-input--amount` | `erp-input-amount` | Amount |
| `pv-error` | `field-error` | Error |

### Mode/Radio Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-mode-group` | `radio-group` | Group |
| `pv-mode-option` | `radio-label` | Label |
| `pv-mode-option__balance` | `field-hint` | Hint |

### Trans Type Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-transtype-group` | `pill-group` | Group |
| `pv-transtype-pill` | `pill-label` | Label |

### Field With Balance Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-field-with-balance` | `field-with-meta` | Field |
| `pv-balance-tag` | `field-hint` | Hint |

### Balance Badges Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `pv-balance-badges` | `info-badges-row` | Row |
| `pv-balance-badge` | `info-badge` | Badge |
| `pv-balance-badge--book` | `badge-info` | Info |
| `pv-balance-badge--passbook` | `badge-info` | Info |

---

## 12. PETTY-CASH-VIEW.html
**File:** `src/app/features/accounts/Accounts_Transactions/petty-cash-view/petty-cash-view.html`

### Structure Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-container` | `module-page` | Container |
| `screen-card` | `erp-card` | Card |

### Header Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-header` | `card-header` | Header |
| `screen-title` | `card-title` | Title |
| `btn-new` | `erp-btn-primary` | New |

### Content Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `screen-content` | `card-body` | Body |

### Toolbar Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `toolbar` | `toolbar` | Toolbar |
| `search-wrapper` | `search-container` | Search |
| `search-icon` | Keep | Icon |
| `search-input` | `erp-input-search` | Input |

### Table Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `table-wrapper` | `table-container` | Container |
| `tbl-header` | `grid-header` | Header |
| `tbl-center` | `grid-header-center` | Center |
| `tbl-right` | `grid-header-right` | Right |
| `tbl-row` | `grid-row` | Row |
| `tbl-cell` | `grid-cell` | Cell |
| `tbl-center` | `grid-cell-center` | Center |
| `tbl-right` | `grid-cell-right` | Right |
| `tbl-empty` | `grid-empty` | Empty |

### Button Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `btn-icon-view` | `erp-btn-icon-view` | View |
| `fa-eye` | Keep (FontAwesome) | Icon |

### Content Classes
| Current Class | Global Design System Equivalent | Purpose |
|---|---|---|
| `voucher-badge` | `badge-primary` | Badge |
| `badge-cash` | `badge-info` | Info |
| `payment-meta` | `text-muted` | Meta |
| `amount-value` | `amount-value` | Amount |
| `na-label` | `text-muted` | NA |

---

## Summary of Common Global Design System Classes

### Core Layout
- `module-page` - Main page/container
- `card-wrapper` - Card container
- `erp-card` - Content card
- `card-header` - Card header
- `card-body` - Card body
- `card-footer` - Card footer

### Forms
- `erp-form-group` - Form field group
- `erp-label` - Field label
- `erp-input` - Input field
- `erp-input-sm` - Small input
- `erp-input-readonly` - Readonly input
- `erp-input-search` - Search input
- `erp-input-amount` - Amount input
- `is-invalid` - Invalid state
- `field-error` - Error message

### Tables/Grids
- `table-container` - Table wrapper
- `grid-header` - Table header
- `grid-cell` - Table cell
- `grid-cell-center` - Centered cell
- `grid-cell-right` - Right-aligned cell
- `grid-cell-action` - Action cell
- `grid-footer` - Footer row
- `grid-empty` - Empty state

### Buttons
- `erp-btn-primary` - Primary button
- `erp-btn-secondary` - Secondary button
- `erp-btn-show` - Show button
- `erp-btn-view` - View button
- `erp-btn-search` - Search button

### Other
- `search-container` - Search wrapper
- `toolbar` - Toolbar
- `tab-group` - Tab group
- `badge` - Badge
- `info-card` - Information card
- `info-section` - Info block
- `info-item` - Info row
- `info-label` - Info label
- `info-value` - Info value
- `empty-state` - Empty message
- `text-muted` - Muted text

---

## Implementation Notes

1. **Bootstrap Utilities**: Keep Bootstrap classes like `col-md-*`, `row`, `d-flex`, etc.
2. **PrimeNG Classes**: Keep `p-*` PrimeNG component classes
3. **Font Awesome Icons**: Keep `fa` and `fa-*` classes
4. **Conditional Classes**: Update dynamically applied classes in TypeScript using `ngClass` bindings
5. **Custom Validators**: Update `app-validation-message` references
6. **Third-party Components**: Keep `ng-select`, `bsDatepicker`, etc.

