export interface Alert {
  id: number;
  type: "info" | "vigilance" | "danger" | "warning";
  title: string;
  message: string;
  source?: string;
  timestamp?: string;
}

export interface HealthRequirement {
  vaccine: string;
  required: boolean;
  recommendation: string;
}

export interface ScamAlert {
  title: string;
  desc: string;
}

export interface VisaInfo {
  type: string;
  duration: string;
  cost: string;
  process: string;
}

export interface TypicalCost {
  item: string;
  price: string;
}

export interface EmergencyContact {
  name: string;
  number: string;
  icon: string;
}

export interface DestinationDetails {
  id: string;
  name: string;
  country: string;
  image: string;
  goSafeScore: number;
  safetyLevel: "safe" | "vigilance" | "danger";
  lastUpdate: string;
  timezone: string;
  language: string;
  currency: string;
  securitySummary: string;
  alerts: Alert[];
  healthRequirements: HealthRequirement[];
  scamAlerts: ScamAlert[];
  visaInfo: VisaInfo;
  typicalCosts: TypicalCost[];
  emergencyNumbers: EmergencyContact[];
  consulateInfo: string;
  
  // Culture
  localCustoms: string[];
  behaviorsToAvoid: string[];
}
