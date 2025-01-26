import { AmenityGroup } from '../types/amenity';
import {
  Wifi,
  Coffee,
  Users,
  UtensilsCrossed,
  Shield,
  Heart,
  Hotel,
  TreePine,
  Gamepad2,
  Sofa,
  Briefcase,
  Plus,
  Dumbbell,
  Car,
  Flame,
  Gamepad,
  UtensilsCrossed as Restaurant,
  Waves,
  Baby,
  Couch,
  Newspaper,
  Refrigerator,
  Wifi as WifiIcon,
  Brush,
  Smoking,
  Iron,
  Wind,
  Zap,
  AlertTriangle,
  Shirt,
  Umbrella,
  BedDouble,
  Bell,
  FirstAid,
  Luggage,
  Phone,
  Accessibility,
  UserPlus,
  Languages,
  HelpingHand,
  Shirt as PoolTowel,
  Trees,
  Basketball,
  Library as LibraryIcon,
  Building,
  Printer as PrinterIcon,
  Copy,
  Users as Conference,
  PartyPopper,
  Gamepad as GameRoom,
  ParkingSquare
} from 'lucide-react';

export const amenityGroups: AmenityGroup[] = [
  {
    category: 'highlighted',
    label: 'Highlighted Amenities',
    description: 'Key features of your property',
    amenities: [
      { id: 'gym', name: 'Gym', category: 'highlighted', icon: 'Dumbbell' },
      { id: 'parking', name: 'Free Parking', category: 'highlighted', icon: 'Car' },
      { id: 'bonfire', name: 'Bonfire', category: 'highlighted', icon: 'Flame' },
      { id: 'indoor-games', name: 'Indoor Games', category: 'highlighted', icon: 'Gamepad' },
      { id: 'restaurant', name: 'Restaurant', category: 'highlighted', icon: 'Restaurant' },
      { id: 'pool', name: 'Swimming Pool', category: 'highlighted', icon: 'Waves' },
      { id: 'kids-area', name: 'Kids Play Area', category: 'highlighted', icon: 'Baby' },
      { id: 'lounge', name: 'Lounge', category: 'highlighted', icon: 'Couch' }
    ]
  },
  {
    category: 'basic',
    label: 'Basic Facilities',
    description: 'Essential amenities for all guests',
    amenities: [
      { id: 'newspaper', name: 'Newspaper', category: 'basic', icon: 'Newspaper' },
      { id: 'refrigerator', name: 'Refrigerator', category: 'basic', icon: 'Refrigerator' },
      { id: 'wifi', name: 'Free Wi-Fi', category: 'basic', icon: 'WifiIcon' },
      { id: 'housekeeping', name: 'Housekeeping', category: 'basic', icon: 'Brush' },
      { id: 'smoking-rooms', name: 'Smoking Rooms', category: 'basic', icon: 'Smoking' },
      { id: 'ironing', name: 'Ironing Service', category: 'basic', icon: 'Iron' },
      { id: 'ac', name: 'Air Conditioning', category: 'basic', icon: 'Wind' },
      { id: 'power-backup', name: 'Power Backup', category: 'basic', icon: 'Zap' },
      { id: 'smoke-detector', name: 'Smoke Detector', category: 'basic', icon: 'AlertTriangle' },
      { id: 'laundry', name: 'Laundry Service', category: 'basic', icon: 'Shirt' },
      { id: 'umbrellas', name: 'Umbrellas', category: 'basic', icon: 'Umbrella' }
    ]
  },
  {
    category: 'family',
    label: 'Family and Kids',
    description: 'Amenities for families with children',
    amenities: [
      { id: 'kids-play-area', name: 'Kids Play Area', category: 'family', icon: 'Baby' }
    ]
  },
  {
    category: 'dining',
    label: 'Food and Drinks',
    description: 'Dining facilities and services',
    amenities: [
      { id: 'restaurant-dining', name: 'Restaurant', category: 'dining', icon: 'Restaurant' },
      { id: 'dining-area', name: 'Dining Area', category: 'dining', icon: 'UtensilsCrossed' }
    ]
  },
  {
    category: 'safety',
    label: 'Safety and Security',
    description: 'Safety features and security measures',
    amenities: [
      { id: 'fire-extinguisher', name: 'Fire Extinguishers', category: 'safety', icon: 'Flame' },
      { id: 'cctv', name: 'CCTV', category: 'safety', icon: 'Shield' }
    ]
  },
  {
    category: 'health',
    label: 'Health and Wellness',
    description: 'Health and wellness facilities',
    amenities: [
      { id: 'gym-fitness', name: 'Gym', category: 'health', icon: 'Dumbbell' },
      { id: 'first-aid', name: 'First-aid Services', category: 'health', icon: 'FirstAid' }
    ]
  },
  {
    category: 'services',
    label: 'General Services',
    description: 'Additional services for guests',
    amenities: [
      { id: 'luggage-storage', name: 'Luggage Storage', category: 'services', icon: 'Luggage' },
      { id: 'wake-up', name: 'Wake-up Call', category: 'services', icon: 'Phone' },
      { id: 'disabled-facilities', name: 'Facilities for Guests with Disabilities', category: 'services', icon: 'Accessibility' },
      { id: 'doctor', name: 'Doctor on Call', category: 'services', icon: 'UserPlus' },
      { id: 'multilingual', name: 'Multilingual Staff', category: 'services', icon: 'Languages' },
      { id: 'luggage-assistance', name: 'Luggage Assistance', category: 'services', icon: 'HelpingHand' },
      { id: 'bellboy', name: 'Bellboy Service', category: 'services', icon: 'Bell' },
      { id: 'pool-towels', name: 'Pool/Beach Towels', category: 'services', icon: 'PoolTowel' }
    ]
  },
  {
    category: 'outdoor',
    label: 'Outdoor Activities and Sports',
    description: 'Outdoor recreational facilities',
    amenities: [
      { id: 'bonfire-area', name: 'Bonfire', category: 'outdoor', icon: 'Flame' },
      { id: 'outdoor-sports', name: 'Outdoor Sports', category: 'outdoor', icon: 'Basketball' }
    ]
  },
  {
    category: 'indoor',
    label: 'Indoor Activities and Sports',
    description: 'Indoor recreational facilities',
    amenities: [
      { id: 'indoor-games-room', name: 'Indoor Games', category: 'indoor', icon: 'Gamepad' }
    ]
  },
  {
    category: 'common',
    label: 'Common Area',
    description: 'Shared spaces and facilities',
    amenities: [
      { id: 'seating-area', name: 'Seating Area', category: 'common', icon: 'Sofa' },
      { id: 'lounge-area', name: 'Lounge', category: 'common', icon: 'Couch' },
      { id: 'verandah', name: 'Verandah', category: 'common', icon: 'Building' },
      { id: 'library', name: 'Library', category: 'common', icon: 'LibraryIcon' },
      { id: 'balcony', name: 'Balcony/Terrace', category: 'common', icon: 'Building' },
      { id: 'reception', name: 'Reception', category: 'common', icon: 'Bell' },
      { id: 'sun-deck', name: 'Sun Deck', category: 'common', icon: 'Sun' },
      { id: 'outdoor-furniture', name: 'Outdoor Furniture', category: 'common', icon: 'Sofa' },
      { id: 'lawn', name: 'Lawn', category: 'common', icon: 'TreePine' }
    ]
  },
  {
    category: 'business',
    label: 'Business Center and Conferences',
    description: 'Business and meeting facilities',
    amenities: [
      { id: 'printer', name: 'Printer', category: 'business', icon: 'PrinterIcon' },
      { id: 'photocopying', name: 'Photocopying', category: 'business', icon: 'Copy' },
      { id: 'conference-room', name: 'Conference Room', category: 'business', icon: 'Conference' },
      { id: 'banquet', name: 'Banquet', category: 'business', icon: 'PartyPopper' }
    ]
  },
  {
    category: 'other',
    label: 'Other Facilities',
    description: 'Additional amenities',
    amenities: [
      { id: 'game-room', name: 'Game Room', category: 'other', icon: 'GameRoom' },
      { id: 'sitout', name: 'Sitout Area', category: 'other', icon: 'Sofa' }
    ]
  }
];