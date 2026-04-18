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

// src/app/features/accounts/Accounts_Transactions/payment-voucher/payment-voucher.ts
var PaymentVoucher = class _PaymentVoucher {
  static \u0275fac = function PaymentVoucher_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _PaymentVoucher)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _PaymentVoucher, selectors: [["app-payment-voucher"]], decls: 2, vars: 0, template: function PaymentVoucher_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "p");
      \u0275\u0275text(1, "payment-voucher works!");
      \u0275\u0275domElementEnd();
    }
  }, encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PaymentVoucher, [{
    type: Component,
    args: [{ selector: "app-payment-voucher", imports: [], template: "<p>payment-voucher works!</p>\r\n" }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(PaymentVoucher, { className: "PaymentVoucher", filePath: "src/app/features/accounts/accounts_transactions/payment-voucher/payment-voucher.ts", lineNumber: 9 });
})();
export {
  PaymentVoucher
};
//# sourceMappingURL=chunk-DZDLFXT2.js.map
