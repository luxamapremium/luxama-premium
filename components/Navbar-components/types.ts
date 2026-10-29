import * as React from "react";
import { useRouter } from "next/navigation";

export interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

export interface NavbarLogoData {
  url: string;
  src: string;
  alt: string;
}

export interface NavbarAuthData {
  login: { text: string; url: string };
  signup: { text: string; url: string };
}

export interface NavbarProps {
  logo?: NavbarLogoData;
  menu?: MenuItem[];
  auth?: NavbarAuthData;
}

export interface NavbarUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  [key: string]: unknown;
}

export interface NavbarLogoProps {
  logo: NavbarLogoData;
  onClick: () => void;
}

export interface DesktopNavProps {
  menu: MenuItem[];
  activeDropdown: string | null;
  onToggleDropdown: (title: string) => void;
  onCloseDropdowns: () => void;
}

export interface DesktopUserMenuProps {
  user: NavbarUser;
  getInitials: (name: string) => string;
  handleLogout: () => void;
  router: ReturnType<typeof useRouter>;
}

export interface DesktopAuthButtonsProps {
  isLoading: boolean;
  user: NavbarUser | null;
  auth: NavbarAuthData;
  getInitials: (name: string) => string;
  handleLogout: () => void;
  router: ReturnType<typeof useRouter>;
}

export interface AppointmentsDropdownProps {
  item: MenuItem;
  closeAllMenus: () => void;
}

export interface FormsDropdownProps {
  item: MenuItem;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  closeAllMenus: () => void;
}

export interface MobileNavMenuProps {
  isOpen: boolean;
  menu: MenuItem[];
  user: NavbarUser | null;
  isLoading: boolean;
  auth: NavbarAuthData;
  closeAllMenus: () => void;
  handleLogout: () => void;
  getInitials: (name: string) => string;
  router: ReturnType<typeof useRouter>;
}
