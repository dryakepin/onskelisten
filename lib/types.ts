export const CATEGORIES = {
  bryg: { label: "Ølbrygning", icon: "🍺" },
  baad: { label: "Båden", icon: "⚓" },
  boeger: { label: "Bøger", icon: "📚" },
  gadget: { label: "Gadgets", icon: "🔌" },
  koekken: { label: "Køkken", icon: "🍳" },
  oplevelse: { label: "Oplevelser", icon: "🎟️" },
  toej: { label: "Tøj", icon: "🧥" },
  andet: { label: "Andet", icon: "🎁" },
} as const;
export type Category = keyof typeof CATEGORIES;

export const PRIORITIES = {
  1: "Ønsker mig allermest",
  2: "Gerne",
  3: "Hvis du står og mangler en idé",
} as const;
export type Priority = 1 | 2 | 3;

export const CURRENCIES = ["DKK", "EUR", "GBP", "SEK", "NOK", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type Occasion = "jul" | "fødselsdag";

export interface Wish {
  id: string;
  title: string;
  url: string;
  price_amount: number | null;
  currency: Currency | null;
  price_checked_at: string | null;
  note: string;
  category: Category;
  priority: Priority;
  occasions: Occasion[];
  status: "active" | "received";
  suggested: boolean;
  received_from: string;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Giver {
  id: string;
  name: string;
  email: string;
  active_for_mail: boolean;
  last_seen_at: string | null;
  sort_order: number;
}

export interface Reservation {
  id: string;
  wish_id: string;
  giver_id: string;
  status: "reserved" | "bought";
}

export interface MailSend {
  id: string;
  sent_at: string;
  occasion: Occasion;
  recipient_ids: string[];
  wish_ids: string[];
  wish_titles: Record<string, string>;
}
