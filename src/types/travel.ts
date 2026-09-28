export interface Attraction {
  id: string;
  name: string;
  category: 'Historic Landmark' | 'Museum' | 'Temple / Sacred Site' | 'Natural Wonder' | 'Viewpoint' | 'Market & District' | 'Architectural Marvel';
  entryFeeLocal: number;
  entryFeeUsd: number;
  entryFeeFormatted: string; // e.g. "Free", "¥1,000 ($6.70)", "€18.00"
  isFree: boolean;
  freeAdmissionTips?: string;
  description: string;
  recommendedDuration: string;
  budgetTravelerHack: string;
  addressOrArea: string;
  highlight: string;
}

export interface SignatureDish {
  dishName: string;
  priceLocal: string;
  priceUsd: number;
  description: string;
}

export interface FoodStall {
  id: string;
  name: string;
  location: string;
  type: string; // e.g. "Night Market Stall", "Hawker Stalls", "Street Food Cart", "Historic Food Alley"
  signatureDishes: SignatureDish[];
  averageMealCostFormatted: string; // e.g. "$2 – $4 / meal"
  averageMealCostUsd: number;
  highlights: string;
  openingHours: string;
  budgetTip: string;
}

export interface BudgetTierEstimation {
  accommodationPerNightUsd: number;
  accommodationDescription: string;
  foodPerDayUsd: number;
  transportPerDayUsd: number;
  miscPerDayUsd: number;
  dailyTotalUsd: number;
  totalForDaysUsd: number;
}

export type TravelStyle = 'shoestring' | 'smartBudget' | 'comfortable';

export interface CityGuide {
  city: string;
  country: string;
  tagline: string;
  summary: string;
  localCurrency: {
    code: string;
    symbol: string;
    exchangeRateToUsd: number; // 1 USD = X localCurrency
  };
  bestBudgetSeason: string;
  dailyBudgetSummary: {
    shoestringDailyUsd: number;
    smartBudgetDailyUsd: number;
    comfortableDailyUsd: number;
  };
  topAttractions: Attraction[];
  famousFoodStalls: FoodStall[];
  budgetTripEstimations: {
    shoestring: BudgetTierEstimation;
    smartBudget: BudgetTierEstimation;
    comfortable: BudgetTierEstimation;
  };
  moneySavingHacks: string[];
  localTransportAdvice: string;
}

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'AUD' | 'CAD';

export interface CurrencyRate {
  code: SupportedCurrency;
  symbol: string;
  rateFromUsd: number; // 1 USD = X target
  label: string;
}
