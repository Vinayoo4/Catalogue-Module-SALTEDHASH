import React, { useEffect, useState } from 'react';
import { CatalogForm } from './components/CatalogForm';
import { catalogAdapter } from './api/adapters';
import { CatalogCategory, CatalogItem } from './types';
import { CatalogRepository } from './services/catalogRepository';

interface NewCatalogItemPageProps {
  initialItem?: CatalogItem | null;
  onSuccess: (item: CatalogItem) => void;
  onCancel: () => void;
}

export const NewCatalogItemPage: React.FC<NewCatalogItemPageProps> = ({
  initialItem,
  onSuccess,
  onCancel,
}) => {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await catalogAdapter.getCatalogCategories();
        setCategories(res.categories);
      } catch (err) {
        console.error('Failed to load categories for form:', err);
      }
    };
    loadCategories();
  }, []);

  const handleCreateCategory = async (name: string) => {
    const res = await CatalogRepository.createCategory(name);
    const updated = await catalogAdapter.getCatalogCategories();
    setCategories(updated.categories);
    return res;
  };

  return (
    <div className="py-2">
      <CatalogForm
        initialItem={initialItem}
        categories={categories}
        onSuccess={onSuccess}
        onCancel={onCancel}
        onCreateCategory={handleCreateCategory}
      />
    </div>
  );
};
