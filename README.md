# Module 5: Catalog — SALTEDHASH Business OS

The **Catalog Module** is the master offering and product/service registry for SALTEDHASH Business OS. It enables small businesses, service providers, freelancers, agencies, local merchants, and retailers to manage products and services with local-first offline persistence, pricing margins, stock tracking, and API contract packaging.

---

## 🌟 Key Architecture & Capabilities

1. **Local-First & Offline Active**
   - Uses IndexedDB via **Dexie.js** for high-performance offline persistence on browser or mobile APK runtimes.
   - Zero reliance on cloud databases or mandatory server connectivity for core operations.

2. **API-Packaged Domain Design**
   - Clean layer separation: **UI Layer ➔ Hook Layer ➔ API Contract Layer ➔ Domain Layer ➔ Repository Layer ➔ Dexie Storage**.
   - Explicit JSON-serializable DTO request and response shapes (`CreateCatalogItemInput`, `CatalogListQuery`, `CatalogSummaryResponse`, `StockAdjustResponse`, etc.).
   - Ready to be wrapped over HTTP under `/api/catalog/*` endpoints.

3. **Product & Service Item Rules**
   - **Products**: Support sellable units, cost prices, profit margin calculations, SKUs, barcodes, tax categories, stock tracking, and low-stock alerts.
   - **Services**: Unlimited availability without stock limits.
   - **Custom Items**: Flexible item structures for special packages and bundled offers.

4. **Sales Module Integration**
   - Features an interactive Sales Quick Picker and Cart Simulator demonstrating real-time catalog item queries and automatic stock reduction on POS checkout.

5. **Category Registry & Organization**
   - System categories (`General`, `Products & Goods`, `Services & Consulting`) and custom category management (add, rename, delete with item auto-reassignment).

6. **Sharing & Presentation**
   - Vector QR Code generation for item verification and copyable client message templates for WhatsApp/quotes.

7. **Automated Test Suite & API Console**
   - Built-in test runner validating domain rules, validation logic, low stock detection, and API response shapes.
   - Interactive API Console for testing live JSON payloads.

---

## 📁 Codebase Structure

```
src/
  modules/
    catalog/
      api/
        contracts.ts        # Service interface contract definition
        dto.ts              # Request/Response DTO types
        catalogService.ts   # Core service implementation
        adapters.ts         # Local adapter layer
      components/
        CatalogSummary.tsx     # Stat counters overview
        CatalogFilters.tsx     # Search, filter pills, view toggles
        CatalogItemCard.tsx    # Card & table row rendering
        CatalogItemDetailCard.tsx # Detailed offering view & stock history
        CatalogForm.tsx        # Mobile-first offering form
        CategoryManager.tsx    # Category manager view
        CategoryPicker.tsx     # Form category picker
        EmptyCatalogState.tsx  # Empty state with demo seed option
        QrShareModal.tsx       # QR code & text share card
        SalesQuickPicker.tsx   # POS Sales integration simulator
        ApiContractTester.tsx  # Interactive API console
        CatalogTestRunner.tsx  # Automated unit/contract tests
      hooks/
        useCatalogList.ts   # Catalog querying & filter hook
        useCatalogForm.ts   # Form state & validation hook
        useCatalogDetail.ts # Single item & stock history hook
      services/
        catalogDb.ts         # Dexie IndexedDB schema
        catalogRepository.ts # CRUD & database transaction logic
        catalogDomain.ts     # Pure domain functions & math
        catalogValidation.ts # Input validation rules
        catalogSeedData.ts   # Realistic initial catalog items
        catalogTests.ts      # Automated unit tests
      types.ts               # Core entity types
      CatalogListPage.tsx    # Primary catalog dashboard view
      NewCatalogItemPage.tsx # Create & edit page
      CatalogItemDetailPage.tsx # Detail page
```

---

## 🚀 Getting Started

1. **Install Dependencies**: `npm install`
2. **Start Dev Server**: `npm run dev` (Runs Express + Vite on port 3000)
3. **Run Automated Tests**: Open the app ➔ click **Automated Tests** tab ➔ click **Run Test Suite**.
