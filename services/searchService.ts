import { SearchItem } from "@/types/search";
import { mockStore } from "./mockStore";

export const searchService = {
  async search(query: string): Promise<SearchItem[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchItem[] = [];

    // Static Navigation items
    const navItems: SearchItem[] = [
      { id: "nav_home", title: "Home Dashboard", subtitle: "Overview, Wellness Score & Vitals", category: "Navigation", href: "/home" },
      { id: "nav_records", title: "Medical Records", subtitle: "Lab Reports, Imaging & Documents", category: "Navigation", href: "/records" },
      { id: "nav_ai", title: "AI Buddy", subtitle: "Health Assistant & Education", category: "Navigation", href: "/ai-buddy" },
      { id: "nav_care", title: "Care Hub", subtitle: "Appointments, Medication Reminders & Follow-ups", category: "Navigation", href: "/care" },
      { id: "nav_profile", title: "Profile & Settings", subtitle: "Personal Data, Allergies & AI Permissions", category: "Navigation", href: "/profile" },
      { id: "nav_overview", title: "Health Overview", subtitle: "Vitals Summary & Metric History", category: "Tools", href: "/health-overview" },
      { id: "nav_risks", title: "Health Risk Overview", subtitle: "Cardiovascular, Diabetes & Screening Factors", category: "Tools", href: "/health-risks" },
      { id: "nav_trends", title: "Health Trends", subtitle: "Longitudinal Analytics & Rate-of-Change", category: "Tools", href: "/health-trends" },
      { id: "nav_meds", title: "My Medicines", subtitle: "Active Prescriptions & Schedule", category: "Tools", href: "/medicines" },
      { id: "nav_explorer", title: "Medicine Explorer", subtitle: "Search Drug Library & Warnings", category: "Tools", href: "/medicines/explorer" },
      { id: "nav_interactions", title: "Drug Interaction Checker", subtitle: "Check Drug-Drug Compatibility", category: "Tools", href: "/medicines/interactions" },
      { id: "nav_symptoms", title: "Symptoms Journal", subtitle: "Log Symptoms, Triggers & Severity", category: "Tools", href: "/symptoms" },
      { id: "nav_lab_library", title: "Lab Test Library", subtitle: "Reference Directory of 20+ Tests", category: "Tools", href: "/lab-tests" },
      { id: "nav_kb", title: "Health Knowledge Base", subtitle: "Educational Health Articles", category: "Tools", href: "/knowledge-base" },
      { id: "nav_nutrition", title: "Nutrition Guide", subtitle: "Healthy Eating Guidelines & Meal Planner", category: "Tools", href: "/nutrition" },
      { id: "nav_doc_summary", title: "Doctor Visit Summary", subtitle: "Generate 1-Page Consultation Brief", category: "Tools", href: "/doctor-summary" },
    ];

    navItems.forEach((item) => {
      if (item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)) {
        results.push(item);
      }
    });

    // Medical records
    mockStore.getRecords().forEach((rec) => {
      if (rec.title.toLowerCase().includes(q) || rec.summary.toLowerCase().includes(q) || rec.institutionName.toLowerCase().includes(q)) {
        results.push({
          id: `search_${rec.id}`,
          title: rec.title,
          subtitle: `${rec.categoryLabel} • ${rec.documentDate}`,
          category: "Medical Records",
          href: `/records/${rec.id}`,
        });
      }
    });

    // Medications
    mockStore.getMedications().forEach((med) => {
      if (med.name.toLowerCase().includes(q) || med.activeIngredient.toLowerCase().includes(q)) {
        results.push({
          id: `search_${med.id}`,
          title: med.name,
          subtitle: `${med.strength} • ${med.frequency}`,
          category: "Medicines",
          href: "/medicines",
        });
      }
    });

    // Appointments
    mockStore.getAppointments().forEach((apt) => {
      if (apt.doctorName.toLowerCase().includes(q) || apt.specialty.toLowerCase().includes(q) || apt.purpose.toLowerCase().includes(q)) {
        results.push({
          id: `search_${apt.id}`,
          title: apt.doctorName,
          subtitle: `${apt.date} • ${apt.purpose}`,
          category: "Appointments",
          href: "/care",
        });
      }
    });

    return results.slice(0, 8);
  },
};

