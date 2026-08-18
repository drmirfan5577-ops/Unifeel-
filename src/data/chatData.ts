import type { Contact, Message, Status } from "@/types";

// Demo data removed — real data will come from Supabase
export const contacts: Contact[] = [];

export const messages: Message[] = [];

export const statuses: Status[] = [
  {
    id: "1",
    name: "My Status",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    time: "Tap to add status",
    seen: true,
    count: 0,
  },
];