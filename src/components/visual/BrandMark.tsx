import { DreamTeamBrandMark } from './DreamTeamBrandMark';

export function BrandMark({
  size = 32,
  showWordmark = false,
  inverted = false,
}: {
  size?: number;
  showWordmark?: boolean;
  inverted?: boolean;
}) {
  return (
    <DreamTeamBrandMark
      size={size}
      showWordmark={showWordmark}
      inverted={inverted}
    />
  );
}
