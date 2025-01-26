export type AmenityCategory =
  | 'highlighted'
  | 'basic'
  | 'family'
  | 'dining'
  | 'safety'
  | 'wellness'
  | 'services'
  | 'outdoor'
  | 'indoor'
  | 'common'
  | 'business'
  | 'other';

export interface Amenity {
  id: string;
  name: string;
  category: AmenityCategory;
  icon?: string;
  description?: string;
  isCustom?: boolean;
  roomTypeIds?: string[];
}

export interface AmenityGroup {
  category: AmenityCategory;
  label: string;
  description: string;
  amenities: Amenity[];
}