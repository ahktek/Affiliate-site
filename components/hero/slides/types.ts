export interface SlideData {
  headline: string;
  subline: string;
  tag?: string;
  ctaPrimaryText: string;
  ctaPrimaryUrl: string;
  ctaSecondaryText?: string;
  ctaSecondaryUrl?: string;
  imageUrl: string;
  imageAlt?: string;
  overlayOpacity?: number;
  overlayColor?: string;
  accentColor?: string;
}

export interface SlideProps {
  data: SlideData;
  isActive: boolean;
  direction: "next" | "prev";
}
