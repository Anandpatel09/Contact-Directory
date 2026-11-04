export interface ApiContact {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  image?: string | null;
}
