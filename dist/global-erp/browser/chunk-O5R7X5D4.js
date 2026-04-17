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

// src/app/features/accounts/Accounts_Reports/day-book/day-book.ts
var DayBook = class _DayBook {
  static \u0275fac = function DayBook_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DayBook)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DayBook, selectors: [["app-day-book"]], decls: 2, vars: 0, template: function DayBook_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "p");
      \u0275\u0275text(1, "day-book works!");
      \u0275\u0275domElementEnd();
    }
  }, encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DayBook, [{
    type: Component,
    args: [{ selector: "app-day-book", imports: [], template: "<p>day-book works!</p>\r\n" }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DayBook, { className: "DayBook", filePath: "src/app/features/accounts/accounts_reports/day-book/day-book.ts", lineNumber: 9 });
})();
export {
  DayBook
};
//# sourceMappingURL=chunk-O5R7X5D4.js.map
