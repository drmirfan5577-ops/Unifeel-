export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isGroup?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  isLive?: boolean;
}

export interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'voice' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  duration?: number;
}

export interface Status {
  id: string;
  name: string;
  avatar: string;
  time: string;
  seen: boolean;
  count: number;
}

export interface ESHubLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  color: string;
}

export interface LauncherTheme {
  id: string;
  name: string;
  gradient: string;
  preview: string;
  style: string;
}

export interface User {
  name: string;
  phone: string;
  email: string;
  avatar: string;
  status: string;
}
