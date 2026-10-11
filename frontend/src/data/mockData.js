// Mock fallbacks ensuring 100% resilient UI during backend restarts or offline demos

export const MOCK_LOCATIONS = [
  {
    id: "bengaluru",
    name: "Bengaluru",
    subtitle: "Karnataka, India",
    region: "City Center",
    lat: 12.9716,
    lon: 77.5946,
    type: "Urban Central",
    aqi: 142,
    pm25: 82,
    level: "Poor",
    color: "#F97316",
    isPopular: true,
  },
  {
    id: "delhi",
    name: "Delhi",
    subtitle: "National Capital Region",
    region: "North India",
    lat: 28.6139,
    lon: 77.2090,
    type: "Megacity",
    aqi: 265,
    pm25: 168,
    level: "Very Poor",
    color: "#8B5CF6",
    isPopular: true,
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    subtitle: "Telangana, India",
    region: "Deccan Plateau",
    lat: 17.3850,
    lon: 78.4867,
    type: "Tech Hub",
    aqi: 92,
    pm25: 46,
    level: "Moderate",
    color: "#EAB308",
    isPopular: true,
  },
  {
    id: "chennai",
    name: "Chennai",
    subtitle: "Tamil Nadu, India",
    region: "Coastal Metro",
    lat: 13.0827,
    lon: 80.2707,
    type: "Coastal",
    aqi: 74,
    pm25: 36,
    level: "Moderate",
    color: "#EAB308",
    isPopular: false,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    subtitle: "Maharashtra, India",
    region: "West Coast",
    lat: 19.0760,
    lon: 72.8777,
    type: "Financial Hub",
    aqi: 132,
    pm25: 72,
    level: "Poor",
    color: "#F97316",
    isPopular: false,
  },
  {
    id: "pune",
    name: "Pune",
    subtitle: "Maharashtra, India",
    region: "Western Ghats",
    lat: 18.5204,
    lon: 73.8567,
    type: "Urban IT",
    aqi: 88,
    pm25: 44,
    level: "Moderate",
    color: "#EAB308",
    isPopular: false,
  },
  {
    id: "kolkata",
    name: "Kolkata",
    subtitle: "West Bengal, India",
    region: "Eastern Metro",
    lat: 22.5726,
    lon: 88.3639,
    type: "Eastern Port",
    aqi: 188,
    pm25: 112,
    level: "Unhealthy",
    color: "#EF4444",
    isPopular: false,
  },
];

// Micro-zones for Bengaluru interactive map
export const MAP_NODES = [
  {
    id: "central",
    name: "Bengaluru Central",
    shortName: "Bengaluru",
    lat: 12.9716,
    lon: 77.5946,
    x: 48, // SVG percent coordinate
    y: 52,
    aqi: 142,
    pm25: 82,
    level: "Poor",
    color: "#F97316",
    status: "Active Monitoring",
  },
  {
    id: "yelahanka",
    name: "Yelahanka",
    shortName: "Yelahanka",
    lat: 13.1007,
    lon: 77.5963,
    x: 52,
    y: 18,
    aqi: 42,
    pm25: 24,
    level: "Good",
    color: "#10B981",
    status: "Clean Air Corridor",
  },
  {
    id: "hebbal",
    name: "Hebbal",
    shortName: "Hebbal",
    lat: 13.0358,
    lon: 77.5970,
    x: 50,
    y: 32,
    aqi: 88,
    pm25: 52,
    level: "Moderate",
    color: "#EAB308",
    status: "Elevated Ring Traffic",
  },
  {
    id: "peenya",
    name: "Peenya Industrial Area",
    shortName: "Peenya",
    lat: 13.0285,
    lon: 77.5197,
    x: 28,
    y: 35,
    aqi: 168,
    pm25: 104,
    level: "Unhealthy",
    color: "#EF4444",
    status: "Industrial Exhaust",
  },
  {
    id: "koramangala",
    name: "Koramangala",
    shortName: "Koramangala",
    lat: 12.9352,
    lon: 77.6245,
    x: 62,
    y: 64,
    aqi: 115,
    pm25: 68,
    level: "Poor",
    color: "#F97316",
    status: "Urban Corridor",
  },
  {
    id: "silk_board",
    name: "Silk Board Junction",
    shortName: "Silk Board",
    lat: 12.9172,
    lon: 77.6228,
    x: 58,
    y: 75,
    aqi: 185,
    pm25: 120,
    level: "Unhealthy",
    color: "#EF4444",
    status: "Choke Point Congestion",
  },
  {
    id: "electronic_city",
    name: "Electronic City",
    shortName: "Electronic City",
    lat: 12.8399,
    lon: 77.6770,
    x: 68,
    y: 86,
    aqi: 95,
    pm25: 58,
    level: "Moderate",
    color: "#EAB308",
    status: "Tollway Transit Zone",
  },
];

export const MOCK_PROFILES = [
  {
    id: "general",
    name: "General Public",
    tagline: "For everyday outdoor activities",
    icon: "Users",
    bgColor: "bg-blue-50 text-blue-600",
    description: "Standard precautions and daily commute advisory",
    advice: "Air quality is expected to decline this evening. Consider finishing outdoor errands before 6 PM.",
  },
  {
    id: "parent",
    name: "Parent",
    tagline: "Keep your family safe",
    icon: "Baby",
    bgColor: "bg-purple-50 text-purple-600",
    description: "Children playtime and outdoor exposure protection",
    advice: "Keep children indoors for games and study sessions during the peak exposure window (6:00 PM – 9:00 PM).",
  },
  {
    id: "delivery_rider",
    name: "Delivery Rider",
    tagline: "High outdoor exposure",
    icon: "Bike",
    bgColor: "bg-amber-50 text-amber-600",
    description: "High-mileage route and shift scheduling advice",
    advice: "Equip sealed N95 particulate respirators and schedule shift breaks inside filtered indoor hubs.",
  },
  {
    id: "runner",
    name: "Runner",
    tagline: "For outdoor exercise",
    icon: "Footprints",
    bgColor: "bg-blue-50 text-blue-600",
    description: "Endurance training and workout timing",
    advice: "Avoid outdoor running between 6 PM – 9 PM. Consider an indoor workout instead.",
  },
  {
    id: "asthma_patient",
    name: "Respiratory Sensitive",
    tagline: "For asthma or respiratory conditions",
    icon: "HeartPulse",
    bgColor: "bg-red-50 text-red-600",
    description: "Asthma and pulmonary vulnerability safeguards",
    advice: "Stay inside well-filtered rooms with HEPA air purifiers active. Keep quick-relief bronchodilators nearby.",
  },
  {
    id: "office_commuter",
    name: "Office Commuter",
    tagline: "Rush-hour transit safety",
    icon: "Briefcase",
    bgColor: "bg-indigo-50 text-indigo-600",
    description: "Transit corridors and road exposure windows",
    advice: "Close vehicle windows with recirculating cabin air enabled; travel prior to peak evening congestion.",
  },
];

export const MOCK_FORECAST_DATA = {
  location: "Bengaluru",
  profile: "runner",
  currentAqi: 142,
  currentPm25: 82,
  currentLevel: "Poor",
  updatedTime: "12 min ago",
  riskLevel: "High Risk",
  riskDescription: "Air quality is likely to worsen over the next 3 hours.",
  riskWindow: "6:00 PM to 9:00 PM",
  projectionTimeline: [
    { time: "Now", pm25: 82, aqi: 142, level: "Poor", color: "#F97316", dotColor: "bg-blue-500" },
    { time: "+1h", pm25: 96, aqi: 160, level: "Poor", color: "#F97316", dotColor: "bg-amber-500" },
    { time: "+2h", pm25: 118, aqi: 185, level: "Unhealthy", color: "#EF4444", dotColor: "bg-orange-500" },
    { time: "+3h", pm25: 137, aqi: 210, level: "Unhealthy", color: "#EF4444", dotColor: "bg-red-500" },
  ],
  pollutants: {
    pm25: 82,
    pm10: 138,
    o3: 48,
    no2: 62,
    so2: 14,
    co: 1.2,
  },
  weather: {
    temp: 28,
    humidity: 65,
    windSpeed: 1.8,
    windDir: "ESE",
  },
  recommendedAction: "Avoid outdoor running between 6 PM – 9 PM. Consider an indoor workout instead.",
};

export const MOCK_BEDROCK_FACTORS = [
  {
    id: "wind",
    title: "Low Wind Speed",
    icon: "Wind",
    color: "blue",
    description: "Lower wind speed can cause pollutants to disperse slowly, leading to higher concentrations.",
    detail: "Surface anemometers report 1.8 m/s, well below the 3.5 m/s ventilation threshold required to flush the urban basin.",
  },
  {
    id: "humidity",
    title: "High Humidity",
    icon: "Droplets",
    color: "blue",
    description: "Higher humidity can increase the concentration of fine particulate matter (PM2.5).",
    detail: "Relative humidity elevated at 65% promotes hygroscopic particulate growth, trapping secondary aerosols closer to ground level.",
  },
  {
    id: "traffic",
    title: "Evening Traffic",
    icon: "Car",
    color: "red",
    description: "Increased vehicle emissions expected during evening rush hours.",
    detail: "Diurnal corridor congestion along Outer Ring Road, Silk Board, and Hebbal peaks between 18:00 and 21:00.",
  },
  {
    id: "trend",
    title: "Rising Trend",
    icon: "TrendingUp",
    color: "orange",
    description: "PM2.5 levels have been increasing over the past few hours.",
    detail: "3-hour rolling telemetry exhibits a +18.4 µg/m³ upward trajectory, crossing the surge escalation boundary.",
  },
];

export const MOCK_ACCURACY = {
  period: "Last 30 days",
  severe_events_detected: 18,
  severe_events_total: 21,
  detection_rate_pct: 85.7,
  false_alarms: 3,
  avg_lead_time_hours: 3.2,
  model_name: "LightGBM Classifier v1.0",
  backtest_points: [
    { date: "Apr 1", actual: 48, predicted: 52 },
    { date: "Apr 4", actual: 56, predicted: 60 },
    { date: "Apr 8", actual: 88, predicted: 84 },
    { date: "Apr 11", actual: 110, predicted: 104 },
    { date: "Apr 15", actual: 125, predicted: 130 },
    { date: "Apr 18", actual: 95, predicted: 102 },
    { date: "Apr 22", actual: 140, predicted: 136 },
    { date: "Apr 26", actual: 115, predicted: 120 },
    { date: "Apr 30", actual: 85, predicted: 90 },
  ],
};

export const MOCK_ALERTS = [
  {
    id: "alert-1",
    severity: "HIGH",
    title: "High pollution expected",
    location: "Bengaluru",
    dateText: "Today 6:00 PM – 9:00 PM",
    action: "Take precautions outdoors.",
    description: "Particulate surge projected (PM2.5 reaching 137 µg/m³) caused by thermal inversion and peak rush-hour vehicle exhaust.",
    icon: "TrendingUp",
    iconColor: "text-red-500",
    badgeBg: "bg-red-50 text-red-600 border-red-100",
    isRecent: true,
  },
  {
    id: "alert-2",
    severity: "MODERATE",
    title: "Moderate risk",
    location: "Bengaluru",
    dateText: "Apr 28 3:00 PM – 6:00 PM",
    action: "Consider reducing outdoor activity.",
    description: "Transient atmospheric stagnation detected across eastern industrial manufacturing hubs.",
    icon: "TrendingUp",
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-50 text-amber-600 border-amber-100",
    isRecent: true,
  },
  {
    id: "alert-3",
    severity: "IMPROVING",
    title: "Air quality improving",
    location: "Bengaluru",
    dateText: "Apr 27",
    action: "Conditions are expected to improve.",
    description: "Fresh pre-monsoon convective showers and 4.5 m/s westerly winds have scrubbed particulate density.",
    icon: "CheckCircle2",
    iconColor: "text-emerald-500",
    badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    isRecent: true,
  },
  {
    id: "alert-4",
    severity: "HIGH",
    title: "High pollution expected",
    location: "Bengaluru",
    dateText: "Apr 25 6:00 PM – 9:00 PM",
    action: "Take precautions outdoors.",
    description: "Localized micro-surge triggered along Outer Ring Road freight transportation corridor.",
    icon: "TrendingUp",
    iconColor: "text-red-500",
    badgeBg: "bg-red-50 text-red-600 border-red-100",
    isRecent: false,
  },
  {
    id: "alert-5",
    severity: "MODERATE",
    title: "Moderate risk",
    location: "Bengaluru",
    dateText: "Apr 21 5:00 PM – 8:00 PM",
    action: "Consider reducing outdoor activity.",
    description: "Elevated particulate readings near Peenya Industrial zone with low horizontal wind dispersal.",
    icon: "TrendingUp",
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-50 text-amber-600 border-amber-100",
    isRecent: false,
  },
];

export const MOCK_NOTIFICATION_SETTINGS = {
  enabled: true,
  riskLevels: {
    highRisk: true,
    veryHighRisk: true,
    moderateRisk: false,
  },
  method: "Email",
  email: "your@email.com",
  selectedLocation: "Bengaluru",
};

export function getAqiAndLevel(pm25) {
  const p = Math.max(0, Number(pm25) || 0);
  if (p <= 12.0) {
    return { aqi: Math.round((50 / 12.0) * p), level: "Good", color: "bg-emerald-500", textClass: "text-emerald-700", bgClass: "bg-emerald-50/80", borderClass: "border-emerald-100", dotColor: "bg-emerald-500" };
  } else if (p <= 35.4) {
    return { aqi: Math.round(51 + ((100 - 51) / (35.4 - 12.1)) * (p - 12.1)), level: "Moderate", color: "bg-amber-500", textClass: "text-amber-700", bgClass: "bg-amber-50/80", borderClass: "border-amber-100", dotColor: "bg-amber-500" };
  } else if (p <= 55.4) {
    return { aqi: Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (p - 35.5)), level: "Poor", color: "bg-orange-500", textClass: "text-orange-700", bgClass: "bg-orange-50/80", borderClass: "border-orange-100", dotColor: "bg-orange-500" };
  } else if (p <= 150.4) {
    return { aqi: Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (p - 55.5)), level: "Unhealthy", color: "bg-rose-500", textClass: "text-rose-700", bgClass: "bg-rose-50/80", borderClass: "border-rose-100", dotColor: "bg-rose-500" };
  } else {
    return { aqi: Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (p - 150.5)), level: "Very Poor", color: "bg-purple-500", textClass: "text-purple-700", bgClass: "bg-purple-50/80", borderClass: "border-purple-100", dotColor: "bg-purple-500" };
  }
}

export function generateHistoricalObservations(currentPm25 = 45.0) {
  const observations = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600 * 1000);
    const hour = t.getHours();
    const rushMultiplier =
      (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21) ? 1.4 : 0.9;
    const noise = Math.sin(i / 3) * 6 + (Math.random() * 4 - 2);
    const pm = Math.max(
      15,
      Math.round((currentPm25 * rushMultiplier + noise) * 10) / 10
    );

    observations.push({
      timestamp: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      rawTime: t.toISOString(),
      pm25: pm,
      pm10: Math.round(pm * 1.7),
      type: "historical",
    });
  }
  return observations;
}


