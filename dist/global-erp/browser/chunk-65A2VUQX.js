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

// src/app/features/accounts/Accounts_Reports/bank-book/bank-book.ts
var BankBook = class _BankBook {
  static \u0275fac = function BankBook_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BankBook)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _BankBook, selectors: [["app-bank-book"]], decls: 2, vars: 0, template: function BankBook_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "p");
      \u0275\u0275text(1, "bank-book works!");
      \u0275\u0275domElementEnd();
    }
  }, encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BankBook, [{
    type: Component,
    args: [{ selector: "app-bank-book", imports: [], template: "<p>bank-book works!</p>\r\n" }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(BankBook, { className: "BankBook", filePath: "src/app/features/accounts/accounts_reports/bank-book/bank-book.ts", lineNumber: 9 });
})();
export {
  BankBook
};
//# sourceMappingURL=chunk-65A2VUQX.js.map
