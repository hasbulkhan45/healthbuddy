export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Medical Records" | "Medicines" | "Measurements" | "Appointments" | "Tools";
  href: string;
  iconName?: string;
}

