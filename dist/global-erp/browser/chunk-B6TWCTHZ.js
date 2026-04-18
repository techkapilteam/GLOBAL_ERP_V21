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

// src/app/features/accounts/Accounts_Reports/account-summary/account-summary.ts
var AccountSummary = class _AccountSummary {
  static \u0275fac = function AccountSummary_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AccountSummary)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AccountSummary, selectors: [["app-account-summary"]], decls: 2, vars: 0, template: function AccountSummary_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "p");
      \u0275\u0275text(1, "account-summary works!");
      \u0275\u0275domElementEnd();
    }
  }, encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AccountSummary, [{
    type: Component,
    args: [{ selector: "app-account-summary", imports: [], template: "<p>account-summary works!</p>\r\n" }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AccountSummary, { className: "AccountSummary", filePath: "src/app/features/accounts/accounts_reports/account-summary/account-summary.ts", lineNumber: 9 });
})();
export {
  AccountSummary
};
//# sourceMappingURL=chunk-B6TWCTHZ.js.map
