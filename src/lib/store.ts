// Local storage based state management

export const ADMIN_PASSWORD = "Admin5577";
export const ADMIN_PASSWORD_ALT = "Daood5577"; // Legacy password also works

export function getUser() {
  const stored = localStorage.getItem("itsme_user");
  if (stored) return JSON.parse(stored);
  return {
    name: "Dr Irfan",
    phone: "+92 300 1234567",
    email: "doc.zaeem86@gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    status: "Hey there! I am using unifeel.",
  };
}

export function saveUser(user: object) {
  localStorage.setItem("itsme_user", JSON.stringify(user));
}

export function isLoggedIn(): boolean {
  return localStorage.getItem("itsme_logged_in") === "true";
}

export function login(phone: string, password: string): boolean {
  // Mock login
  if (phone.length >= 10 && password.length >= 4) {
    localStorage.setItem("itsme_logged_in", "true");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem("itsme_logged_in");
  // Also sign out from Supabase (non-blocking)
  import("@/lib/supabase").then(({ supabase }) => supabase.auth.signOut()).catch(() => {});
}

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD || password === ADMIN_PASSWORD_ALT;
}

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem("itsme_admin_auth") === "true";
}

export function setAdminAuth(value: boolean) {
  if (value) {
    sessionStorage.setItem("itsme_admin_auth", "true");
  } else {
    sessionStorage.removeItem("itsme_admin_auth");
  }
}

export function getESHubLinks() {
  const stored = localStorage.getItem("itsme_eshub_links");
  if (stored) return JSON.parse(stored);
  return [
    { id: "1", title: "Google", url: "https://google.com", icon: "🌐", color: "#4285F4" },
    { id: "2", title: "YouTube", url: "https://youtube.com", icon: "📺", color: "#FF0000" },
    { id: "3", title: "WhatsApp Web", url: "https://web.whatsapp.com", icon: "💬", color: "#25D366" },
    { id: "4", title: "Facebook", url: "https://facebook.com", icon: "👥", color: "#1877F2" },
    { id: "5", title: "Instagram", url: "https://instagram.com", icon: "📸", color: "#E1306C" },
    { id: "6", title: "Twitter/X", url: "https://x.com", icon: "🐦", color: "#1DA1F2" },
    { id: "7", title: "LinkedIn", url: "https://linkedin.com", icon: "💼", color: "#0A66C2" },
    { id: "8", title: "Gmail", url: "https://gmail.com", icon: "📧", color: "#EA4335" },
    { id: "9", title: "Wikipedia", url: "https://wikipedia.org", icon: "📖", color: "#000000" },
    { id: "10", title: "Amazon", url: "https://amazon.com", icon: "🛒", color: "#FF9900" },
  ];
}

export function saveESHubLinks(links: object[]) {
  localStorage.setItem("itsme_eshub_links", JSON.stringify(links));
}

export function getSelectedTheme(): string {
  return localStorage.getItem("itsme_theme") || "theme1";
}

export function setSelectedTheme(theme: string) {
  localStorage.setItem("itsme_theme", theme);
}

export function getPrivateVaultData() {
  const stored = localStorage.getItem("itsme_vault");
  if (stored) return JSON.parse(stored);
  return { notes: [], isLocked: true };
}

export function savePrivateVaultData(data: object) {
  localStorage.setItem("itsme_vault", JSON.stringify(data));
}

export function getVaultPin(): string {
  return localStorage.getItem("itsme_vault_pin") || "1234";
}

export function setVaultPin(pin: string) {
  localStorage.setItem("itsme_vault_pin", pin);
}
