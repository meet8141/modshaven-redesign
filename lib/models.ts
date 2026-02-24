// Data models for Mod and User (schema only, not DB logic)

export interface Mod {
  _id?: string;
  name: string;
  description: string;
  author: string;
  game: 'BeamNG.drive' | 'Assetto Corsa';
  featured?: boolean;
  downloads_size: string;
  AD_link?: string;
  download_link: string;
  mod_image: string;
  images?: string[];
  date_added?: string;
  downloads?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id?: string;
  fullName: string;
  email: string;
  salt?: string;
  password: string;
  profileImageURL?: string;
  role?: 'USER' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
}
