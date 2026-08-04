export type Language = 'fr' | 'ar';
export type Theme = 'light' | 'dark';

export type Gender = 'female' | 'male';

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined';

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  city: string; // Wilaya (e.g., "Alger", "Oran", "Constantine")
  profession: string;
  education?: string;
  bio: string;
  photos: string[];
  interests: string[];
  isVerified: boolean;
  isBanned?: boolean;
  isOnline?: boolean;
  lastSeen?: string; // '15m' | '2h' | '1d' | '3d'
  hideFriendsList?: boolean;
  distanceKm: number;
  lat?: number;
  lng?: number;
  locationName?: string;
  heightCm?: number;
  lookingFor: string;
  likesYou?: boolean; // Mock flag indicating if this profile liked the user
  friendshipStatus?: FriendshipStatus;
}

export interface Message {
  id: string;
  senderId: string; // 'user' or profile.id
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  mediaUrl?: string;
  isAudio?: boolean;
  audioDuration?: number;
  audioUrl?: string;
}

export interface FilterState {
  gender: 'all' | 'female' | 'male';
  minAge: number;
  maxAge: number;
  city: string; // 'all' or specific wilaya
  cities: string[]; // List of selected wilayas for multi-selection filter
  interest: string; // 'all' or specific interest
  verifiedOnly: boolean;
  activeLast7Days?: boolean;
  searchQuery: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  city: string;
  profession: string;
  bio: string;
  photos: string[];
  interests: string[];
  isVerified: boolean;
  lookingFor: string;
  hideFriendsList?: boolean;
  lat?: number;
  lng?: number;
  locationName?: string;
}

export type ReportReason = 'fake_profile' | 'inappropriate_messages' | 'harassment' | 'spam' | 'other';
