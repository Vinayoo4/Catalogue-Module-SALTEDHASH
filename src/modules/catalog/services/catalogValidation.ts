import { CreateCatalogItemInput, UpdateCatalogItemInput } from '../api/dto';

export interface ValidationErrorMap {
  [field: string]: string;
}

export function validateCatalogItemInput(input: CreateCatalogItemInput | UpdateCatalogItemInput): {
  isValid: boolean;
  errors: ValidationErrorMap;
} {
  const errors: ValidationErrorMap = {};

  if (!input.name || input.name.trim().length === 0) {
    errors.name = 'Item name is required.';
  } else if (input.name.trim().length > 120) {
    errors.name = 'Item name cannot exceed 120 characters.';
  }

  if (input.price === undefined || input.price === null || isNaN(input.price)) {
    errors.price = 'Price is required.';
  } else if (input.price < 0) {
    errors.price = 'Price cannot be negative.';
  }

  if (input.costPrice !== undefined && input.costPrice !== null && !isNaN(input.costPrice)) {
    if (input.costPrice < 0) {
      errors.costPrice = 'Cost price cannot be negative.';
    }
  }

  if (input.type === 'product' && input.stockTracked) {
    if (input.stockQty !== undefined && input.stockQty !== null) {
      if (isNaN(input.stockQty) || input.stockQty < 0) {
        errors.stockQty = 'Stock quantity cannot be negative.';
      }
    }
    if (input.lowStockThreshold !== undefined && input.lowStockThreshold !== null) {
      if (isNaN(input.lowStockThreshold) || input.lowStockThreshold < 0) {
        errors.lowStockThreshold = 'Low stock threshold cannot be negative.';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
