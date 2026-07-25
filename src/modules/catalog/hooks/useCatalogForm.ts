import { useState } from 'react';
import { catalogAdapter } from '../api/adapters';
import { CreateCatalogItemInput, UpdateCatalogItemInput } from '../api/dto';
import { validateCatalogItemInput, ValidationErrorMap } from '../services/catalogValidation';
import { CatalogItem, ItemType } from '../types';

export interface CatalogFormValues {
  id?: string;
  name: string;
  type: ItemType;
  categoryId: string;
  categoryName: string;
  description: string;
  sku: string;
  barcode: string;
  unit: string;
  price: string | number;
  costPrice: string | number;
  stockTracked: boolean;
  stockQty: string | number;
  lowStockThreshold: string | number;
  taxLabel: string;
  imageUrl: string;
  tagsInput: string;
}

const DEFAULT_FORM_VALUES: CatalogFormValues = {
  name: '',
  type: 'product',
  categoryId: '',
  categoryName: '',
  description: '',
  sku: '',
  barcode: '',
  unit: 'pcs',
  price: '',
  costPrice: '',
  stockTracked: true,
  stockQty: '0',
  lowStockThreshold: '5',
  taxLabel: 'Standard (10%)',
  imageUrl: '',
  tagsInput: '',
};

export function useCatalogForm(initialItem?: CatalogItem | null, onSuccess?: (item: CatalogItem) => void) {
  const [values, setValues] = useState<CatalogFormValues>(() => {
    if (!initialItem) return DEFAULT_FORM_VALUES;
    return {
      id: initialItem.id,
      name: initialItem.name || '',
      type: initialItem.type || 'product',
      categoryId: initialItem.categoryId || '',
      categoryName: initialItem.categorySnapshot || '',
      description: initialItem.description || '',
      sku: initialItem.sku || '',
      barcode: initialItem.barcode || '',
      unit: initialItem.unit || (initialItem.type === 'product' ? 'pcs' : 'session'),
      price: initialItem.price ?? '',
      costPrice: initialItem.costPrice ?? '',
      stockTracked: initialItem.type === 'product' ? (initialItem.stockTracked ?? false) : false,
      stockQty: initialItem.stockQty ?? '0',
      lowStockThreshold: initialItem.lowStockThreshold ?? '5',
      taxLabel: initialItem.taxLabel || 'Standard (10%)',
      imageUrl: initialItem.imageUrl || '',
      tagsInput: initialItem.tags ? initialItem.tags.join(', ') : '',
    };
  });

  const [errors, setErrors] = useState<ValidationErrorMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const updateField = (field: keyof CatalogFormValues, value: any) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      // Auto adjustment when type switches between product and service
      if (field === 'type') {
        if (value === 'service') {
          next.stockTracked = false;
          next.unit = prev.unit === 'pcs' ? 'session' : prev.unit;
        } else if (value === 'product') {
          next.stockTracked = true;
          next.unit = prev.unit === 'session' ? 'pcs' : prev.unit;
        }
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const setFormValues = (newValues: Partial<CatalogFormValues>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  };

  const resetForm = () => {
    setValues(DEFAULT_FORM_VALUES);
    setErrors({});
    setServerError(null);
  };

  const submitForm = async (): Promise<CatalogItem | null> => {
    try {
      setSubmitting(true);
      setServerError(null);

      const numericPrice = parseFloat(String(values.price)) || 0;
      const numericCostPrice = values.costPrice !== '' && values.costPrice !== undefined ? parseFloat(String(values.costPrice)) : undefined;
      const numericStockQty = values.stockQty !== '' && values.stockQty !== undefined ? parseInt(String(values.stockQty), 10) : undefined;
      const numericLowStock = values.lowStockThreshold !== '' && values.lowStockThreshold !== undefined ? parseInt(String(values.lowStockThreshold), 10) : undefined;

      const parsedTags = values.tagsInput
        ? values.tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : undefined;

      const payloadInput: CreateCatalogItemInput = {
        name: values.name,
        type: values.type,
        categoryId: values.categoryId || undefined,
        categoryName: values.categoryName || undefined,
        description: values.description,
        sku: values.sku,
        barcode: values.barcode,
        unit: values.unit,
        price: numericPrice,
        costPrice: numericCostPrice,
        stockTracked: values.type === 'product' ? values.stockTracked : false,
        stockQty: values.type === 'product' && values.stockTracked ? numericStockQty : undefined,
        lowStockThreshold: values.type === 'product' && values.stockTracked ? numericLowStock : undefined,
        taxLabel: values.taxLabel,
        imageUrl: values.imageUrl,
        tags: parsedTags,
      };

      const validation = validateCatalogItemInput(payloadInput);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setSubmitting(false);
        return null;
      }

      let savedItem: CatalogItem;

      if (values.id) {
        const updatePayload: UpdateCatalogItemInput = {
          ...payloadInput,
          id: values.id,
        };
        const res = await catalogAdapter.updateCatalogItem(updatePayload);
        savedItem = res.item;
      } else {
        const res = await catalogAdapter.createCatalogItem(payloadInput);
        savedItem = res.item;
      }

      setSubmitting(false);
      if (onSuccess) {
        onSuccess(savedItem);
      }
      return savedItem;
    } catch (err: any) {
      console.error('Error submitting catalog form:', err);
      setServerError(err.message || 'Failed to save item.');
      setSubmitting(false);
      return null;
    }
  };

  return {
    values,
    errors,
    submitting,
    serverError,
    updateField,
    setFormValues,
    resetForm,
    submitForm,
  };
}
