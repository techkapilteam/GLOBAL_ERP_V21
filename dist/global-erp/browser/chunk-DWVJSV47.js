import {
  Component,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵtext
} from "./chunk-JNQEWJJK.js";
import "./chunk-R327OCYJ.js";

// src/app/features/accounts/Accounts_Reports/cash-book/cash-book.ts
var CashBook = class _CashBook {
  static \u0275fac = function CashBook_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CashBook)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CashBook, selectors: [["app-cash-book"]], decls: 2, vars: 0, template: function CashBook_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "p");
      \u0275\u0275text(1, "cash-book works!");
      \u0275\u0275domElementEnd();
    }
  }, encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CashBook, [{
    type: Component,
    args: [{ selector: "app-cash-book", imports: [], template: "<p>cash-book works!</p>\r\n" }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CashBook, { className: "CashBook", filePath: "src/app/features/accounts/accounts_reports/cash-book/cash-book.ts", lineNumber: 9 });
})();
export {
  CashBook
};
//# sourceMappingURL=chunk-DWVJSV47.js.map
