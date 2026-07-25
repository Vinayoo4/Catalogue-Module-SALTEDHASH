import React, { useState } from 'react';
import { CatalogItemDetailCard } from './components/CatalogItemDetailCard';
import { QrShareModal } from './components/QrShareModal';
import { CatalogItem } from './types';

interface CatalogItemDetailPageProps {
  itemId: string;
  onBack: () => void;
  onEdit: (item: CatalogItem) => void;
  onDuplicateSuccess: (newItem: CatalogItem) => void;
  onQuickSale: (item: CatalogItem) => void;
}

export const CatalogItemDetailPage: React.FC<CatalogItemDetailPageProps> = ({
  itemId,
  onBack,
  onEdit,
  onDuplicateSuccess,
  onQuickSale,
}) => {
  const [qrItem, setQrItem] = useState<CatalogItem | null>(null);

  return (
    <div className="py-2">
      <CatalogItemDetailCard
        itemId={itemId}
        onBack={onBack}
        onEdit={onEdit}
        onDuplicateSuccess={onDuplicateSuccess}
        onQuickSale={onQuickSale}
        onOpenQrModal={setQrItem}
      />

      <QrShareModal item={qrItem} onClose={() => setQrItem(null)} />
    </div>
  );
};
