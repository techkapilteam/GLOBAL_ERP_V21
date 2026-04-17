import "./chunk-R327OCYJ.js";

// src/app/features/accounts/accounts_routs.ts
var accountsRoutes = [
  // ✅ ACCOUNTS CONFIG
  {
    path: "accounts-config",
    children: [
      {
        path: "bank-config",
        loadComponent: () => import("./chunk-JPQEAF4Q.js").then((m) => m.BankConfigComponent)
      },
      {
        path: "bank-config-view",
        loadComponent: () => import("./chunk-BQUA53SK.js").then((m) => m.BankConfigView)
      },
      {
        path: "cheque-management",
        loadComponent: () => import("./chunk-4SKULL3W.js").then((m) => m.ChequeManagement)
      },
      {
        path: "cheque-managementnew",
        loadComponent: () => import("./chunk-XCZGVERK.js").then((m) => m.ChequeManagementnew)
      }
    ]
  },
  // ✅ ACCOUNTS TRANSACTIONS
  {
    path: "accounts-transactions",
    children: [
      {
        path: "general-receipt",
        loadComponent: () => import("./chunk-VO7ASGAK.js").then((m) => m.GeneralReceipt)
      },
      {
        path: "payment-voucher",
        loadComponent: () => import("./chunk-DZDLFXT2.js").then((m) => m.PaymentVoucher)
      },
      {
        path: "journal-voucher-view",
        loadComponent: () => import("./chunk-XA4LQS26.js").then((m) => m.JournalVoucherView)
      },
      {
        path: "cheques-onhand",
        loadComponent: () => import("./chunk-MWFFA2HU.js").then((m) => m.ChequesOnhand)
      },
      {
        path: "cheques-inbank",
        loadComponent: () => import("./chunk-KLI6L4CC.js").then((m) => m.ChequesInbank)
      },
      {
        path: "cheques-issued",
        loadComponent: () => import("./chunk-VK6ZA5VK.js").then((m) => m.ChequesIssued)
      },
      {
        path: "petty-cash-view",
        loadComponent: () => import("./chunk-5T7AXLPH.js").then((m) => m.PettyCashView)
      },
      {
        path: "general-receipt-cancel",
        loadComponent: () => import("./chunk-CCDD53WI.js").then((m) => m.GeneralReceiptCancel)
      },
      {
        path: "pettycash-receipt-cancel",
        loadComponent: () => import("./chunk-UDAKEFIY.js").then((m) => m.PettycashReceiptCancel)
      },
      {
        path: "tds-jv",
        loadComponent: () => import("./chunk-JIWPMQ5J.js").then((m) => m.TdsJv)
      },
      {
        path: "funds-transfer-out",
        loadComponent: () => import("./chunk-ONHAOIR5.js").then((m) => m.FundTransferOut)
      }
    ]
  },
  // ✅ ACCOUNTS REPORTS
  {
    path: "accounts-reports",
    children: [
      {
        path: "account-ledger",
        loadComponent: () => import("./chunk-WQRVUIEW.js").then((m) => m.AccountLedger)
      },
      {
        path: "account-summary",
        loadComponent: () => import("./chunk-B6TWCTHZ.js").then((m) => m.AccountSummary)
      },
      {
        path: "bank-book",
        loadComponent: () => import("./chunk-65A2VUQX.js").then((m) => m.BankBook)
      },
      {
        path: "bank-entries",
        loadComponent: () => import("./chunk-CKNNHECS.js").then((m) => m.BankEntries)
      },
      {
        path: "brs",
        loadComponent: () => import("./chunk-P6TW6PQR.js").then((m) => m.Brs)
      },
      {
        path: "brs-statements",
        loadComponent: () => import("./chunk-6R3SP7ZP.js").then((m) => m.BrsStatements)
      },
      {
        path: "cash-book",
        loadComponent: () => import("./chunk-DWVJSV47.js").then((m) => m.CashBook)
      },
      {
        path: "cheque-cancel",
        loadComponent: () => import("./chunk-IVH2BNLK.js").then((m) => m.ChequeCancel)
      },
      {
        path: "cheque-enquiry",
        loadComponent: () => import("./chunk-7CUHOWYT.js").then((m) => m.ChequeEnquiry)
      },
      {
        path: "cheque-return",
        loadComponent: () => import("./chunk-7HXIB3OP.js").then((m) => m.ChequeReturn)
      },
      {
        path: "comparison-tb",
        loadComponent: () => import("./chunk-CWIYEU6C.js").then((m) => m.ComparisonTb)
      },
      {
        path: "day-book",
        loadComponent: () => import("./chunk-O5R7X5D4.js").then((m) => m.DayBook)
      },
      {
        path: "gst-report",
        loadComponent: () => import("./chunk-BBIRT3DU.js").then((m) => m.GstReport)
      },
      {
        path: "issued-cheque",
        loadComponent: () => import("./chunk-IAY2TGOL.js").then((m) => m.IssuedCheque)
      },
      {
        path: "jv-list",
        loadComponent: () => import("./chunk-AB2O6MD4.js").then((m) => m.JvList)
      },
      {
        path: "ledger-extract",
        loadComponent: () => import("./chunk-P6FBIVPR.js").then((m) => m.LedgerExtract)
      },
      {
        path: "re-print",
        loadComponent: () => import("./chunk-MACCECNB.js").then((m) => m.RePrint)
      },
      {
        path: "schedule-tb",
        loadComponent: () => import("./chunk-4ZMTR6Z5.js").then((m) => m.ScheduleTb)
      },
      {
        path: "tds-report",
        loadComponent: () => import("./chunk-XQIY6HNM.js").then((m) => m.TdsReport)
      },
      {
        path: "trial-balance",
        loadComponent: () => import("./chunk-CXQOXJG4.js").then((m) => m.TrialBalance)
      }
    ]
  }
];
export {
  accountsRoutes
};
//# sourceMappingURL=chunk-G4XV5YYQ.js.map
