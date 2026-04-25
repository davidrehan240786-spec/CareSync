export interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  price: string;
  coverage: string[];
  risk_supported: string[];
  conditions_supported: string[];
  vitals_focus: string[];
  claim_ratio: string;
  badge?: string;
  description: string;
  logo?: string;
  min_age?: number;
  max_age?: number;
}

export const insurancePlans: InsurancePlan[] = [
  {
    id: "1",
    name: "Care Plus Health Insurance",
    provider: "Star Health",
    price: "₹8,000/year",
    coverage: ["Hospitalization", "Pre & Post Care", "Diagnostics"],
    risk_supported: ["Low", "Medium"],
    conditions_supported: ["Diabetes", "Hypertension", "Thyroid"],
    vitals_focus: ["diabetes"],
    claim_ratio: "92%",
    badge: "Best Seller",
    description: "Affordable plan for everyday health coverage with minimal waiting period.",
    logo: "⭐",
    min_age: 18,
    max_age: 65
  },
  {
    id: "2",
    name: "Critical Shield Pro",
    provider: "HDFC Ergo",
    price: "₹15,000/year",
    coverage: ["Critical Illness", "ICU", "Surgery", "Ambulance"],
    risk_supported: ["Medium", "High"],
    conditions_supported: ["Heart Disease", "Diabetes", "Kidney Issues", "Cancer"],
    vitals_focus: ["heart", "cholesterol"],
    claim_ratio: "95%",
    badge: "High Coverage",
    description: "Comprehensive coverage for major illnesses and high-risk health profiles.",
    logo: "🛡️",
    min_age: 18,
    max_age: 70
  },
  {
    id: "3",
    name: "Basic Health Cover",
    provider: "ICICI Lombard",
    price: "₹5,000/year",
    coverage: ["Basic Hospitalization", "Emergency Care"],
    risk_supported: ["Low"],
    conditions_supported: [],
    vitals_focus: [],
    claim_ratio: "89%",
    badge: "Budget",
    description: "Simple and affordable entry-level plan for young and healthy individuals.",
    logo: "🏥",
    min_age: 18,
    max_age: 50
  },
  {
    id: "4",
    name: "Family First Platinum",
    provider: "Niva Bupa",
    price: "₹22,000/year",
    coverage: ["Maternity", "Newborn Cover", "OPD", "Ayush"],
    risk_supported: ["Low", "Medium"],
    conditions_supported: ["Asthma", "Allergies"],
    vitals_focus: [],
    claim_ratio: "94%",
    badge: "Most Popular",
    description: "Premium plan covering all family members with extensive OPD benefits.",
    logo: "👨‍👩‍👧‍👦",
    min_age: 21,
    max_age: 65
  },
  {
    id: "5",
    name: "Senior Citizen Special",
    provider: "Care Health",
    price: "₹12,500/year",
    coverage: ["Home Care", "Annual Checkups", "Ayurveda"],
    risk_supported: ["Medium", "High"],
    conditions_supported: ["Arthritis", "Diabetes", "Hypertension"],
    vitals_focus: ["diabetes", "heart"],
    claim_ratio: "93%",
    badge: "Senior Special",
    description: "Tailored for individuals above 60 with focus on preventive care.",
    logo: "👴",
    min_age: 60,
    max_age: 99
  }
];
