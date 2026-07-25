import { catalogService } from '../api/catalogService';
import { isLowStock, calculateProfitMargin } from './catalogDomain';
import { validateCatalogItemInput } from './catalogValidation';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export async function runCatalogTestSuite(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: Item Validation Rules
  try {
    const invalidRes = validateCatalogItemInput({ name: '', price: -10, type: 'product' });
    const isValidTestPass = !invalidRes.isValid && invalidRes.errors.name !== undefined && invalidRes.errors.price !== undefined;
    results.push({
      name: 'Item Input Validation Rule',
      passed: isValidTestPass,
      message: isValidTestPass ? 'Correctly rejected empty name and negative price.' : 'Failed to validate invalid inputs.',
    });
  } catch (err: any) {
    results.push({ name: 'Item Input Validation Rule', passed: false, message: err.message });
  }

  // Test 2: Low Stock Detection
  try {
    const lowStockProduct = {
      id: 'test-low',
      itemCode: 'ITEM-TEST',
      name: 'Test Low Stock',
      type: 'product' as const,
      price: 10,
      stockTracked: true,
      stockQty: 2,
      lowStockThreshold: 5,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const isLow = isLowStock(lowStockProduct);
    results.push({
      name: 'Low-Stock Detection Rule',
      passed: isLow === true,
      message: isLow ? 'Accurately detected stock (2) <= threshold (5).' : 'Failed to trigger low stock flag.',
    });
  } catch (err: any) {
    results.push({ name: 'Low-Stock Detection Rule', passed: false, message: err.message });
  }

  // Test 3: Profit Margin Calculation
  try {
    const margin = calculateProfitMargin(100, 40);
    const passed = margin === 60;
    results.push({
      name: 'Profit Margin Calculation',
      passed,
      message: passed ? `Calculated profit margin 60% correctly ($100 price, $40 cost).` : `Margin calculated as ${margin}, expected 60%.`,
    });
  } catch (err: any) {
    results.push({ name: 'Profit Margin Calculation', passed: false, message: err.message });
  }

  // Test 4: API Service Response Shape & Create Item
  try {
    const createdRes = await catalogService.createCatalogItem({
      name: 'Unit Test Temp Item',
      type: 'product',
      price: 15.00,
      costPrice: 5.00,
      stockTracked: true,
      stockQty: 10,
      unit: 'pcs',
    });
    const hasItemCode = Boolean(createdRes.item.itemCode && createdRes.item.itemCode.startsWith('ITEM-'));
    results.push({
      name: 'API Service Create Item Contract',
      passed: hasItemCode,
      message: hasItemCode ? `Item created with auto code ${createdRes.item.itemCode}` : 'Missing valid item code format.',
    });

    // Cleanup created test item by archiving
    if (createdRes.item.id) {
      await catalogService.archiveCatalogItem(createdRes.item.id);
    }
  } catch (err: any) {
    results.push({ name: 'API Service Create Item Contract', passed: false, message: err.message });
  }

  // Test 5: Category Summary Consistency
  try {
    const catSummary = await catalogService.getCatalogCategories();
    const passed = Array.isArray(catSummary.categories) && catSummary.categories.length > 0;
    results.push({
      name: 'Category Summary Integrity',
      passed,
      message: passed ? `Retrieved ${catSummary.categories.length} categories with item counts.` : 'Failed category retrieval.',
    });
  } catch (err: any) {
    results.push({ name: 'Category Summary Integrity', passed: false, message: err.message });
  }

  return results;
}
