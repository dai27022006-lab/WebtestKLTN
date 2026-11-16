'use client';

import { HeroVisualStack } from '@/components/visual/DreamTeamMockups';
import type { ProductType } from '@/types/api';

export function WorkspaceShowcaseFrame({
  activeType,
  onSelectType,
}: {
  activeType: ProductType;
  onSelectType: (type: ProductType) => void;
}) {
  return <HeroVisualStack activeType={activeType} onSelectType={onSelectType} />;
}
