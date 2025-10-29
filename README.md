

##  Overview

This project automates **end-to-end UI testing** for the **GoTrade Application**  
[`https://test1.gotrade.goquant.io`](https://test1.gotrade.goquant.io) using **Playwright**.  
It validates **Login**, **Logout**, **GoOps**, **Gosettle**, and **Trading Flows (Market, Limit, TWAP, Ratio)**.

---

##  Tech Stack

| Component | Description |
|------------|-------------|
| **Language** | TypeScript |
| **Framework** | Playwright Test |
| **Browser** | Chromium (Headed / Headless) |
| **Pattern** | Page Object Model (POM) |
| **Assertions** | Built-in Playwright `expect()` |

---

##  Folder Structure
qa-assessment-shweta/
│
├── pages/
│ ├── LoginPage.ts
│ ├── TradePage.ts
│ ├── OrdersPage.ts
│ ├── AccountsPage.ts
│ └── GoOpsPage.ts
│
├── tests/
│ ├── auth/
│ │ ├── login.spec.ts
│ │ └── logout.spec.ts
│ ├── trading/
│ │ ├── marketEdge.spec.ts
│ │ ├── limitEdge.spec.ts
│ │ └── ratio.spec.ts
│ ├── goops/
│ │ └── settleTransfer.spec.ts
│ ├── accounts/
│ │ └── accounts.spec.ts
│ └── smoke.spec.ts
│
├── utils/
│ ├── testData.ts
│ └── helpers.ts
│
├── playwright.config.ts
├── package.json
└── README.md


---

##  Installation & Setup

### 1️ Prerequisites
- Node.js v18 or higher
- npm (comes with Node)

### 2️ Clone the Repository
```bash
git clone https://github.com/shwetanagpal758/qa-assessment-shweta.git
cd qa-assessment-shweta
##instal dependencies
npm install
## Install Playwright Browsers
npx playwright install

## Run All Tests
npx playwright test --project=chromium
  ##  Run Specific Test File
  npx playwright test tests/auth/login.spec.ts --project=chromium --headed
  npx playwright test tests/trading/marketEdge.spec.ts --project=chromium --headed

npx playwright test tests/auth/logout.spec.ts --project=chromium --headed


## Environment Variables 
export BASE_URL="https://test1.gotrade.goquant.io"

##Report Link##
https://1drv.ms/b/s!AmEk3faIv1bmxC-B2Zjl9clcSfE8?e=vjOffi



