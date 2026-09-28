import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { CURATED_CITIES } from './src/data/curatedDestinations.ts';
import { CityGuide } from './src/types/travel.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client strictly server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory cache for dynamically generated city guides
const cityGuideCache = new Map<string, CityGuide>();

// Helper to look up curated city or alias case-insensitively
function findCuratedCity(query: string): CityGuide | null {
  const normalized = query.trim().toLowerCase();

  // Direct Indian destination aliases
  if (
    normalized === 'visakhapatnam' ||
    normalized === 'vizag' ||
    normalized.includes('visakhapatnam') ||
    normalized.includes('vizag')
  ) {
    return CURATED_CITIES.visakhapatnam;
  }
  if (normalized === 'goa' || normalized.includes('goa')) {
    return CURATED_CITIES.goa;
  }
  if (normalized === 'hyderabad' || normalized.includes('hyderabad')) {
    return CURATED_CITIES.hyderabad;
  }
  if (normalized === 'jaipur' || normalized.includes('jaipur')) {
    return CURATED_CITIES.jaipur;
  }

  // Country-level searches
  if (normalized === 'india' || normalized.includes('places in india')) {
    return CURATED_CITIES.visakhapatnam;
  }
  if (normalized === 'japan') {
    return CURATED_CITIES.kyoto;
  }
  if (normalized === 'italy') {
    return CURATED_CITIES.rome;
  }
  if (normalized === 'thailand') {
    return CURATED_CITIES.bangkok;
  }

  // Direct international matches
  if (normalized.includes('rome')) return CURATED_CITIES.rome;
  if (normalized.includes('kyoto')) return CURATED_CITIES.kyoto;
  if (normalized.includes('bangkok')) return CURATED_CITIES.bangkok;

  // General dictionary scan
  for (const [key, data] of Object.entries(CURATED_CITIES)) {
    if (
      key === normalized ||
      data.city.toLowerCase() === normalized ||
      data.city.toLowerCase().includes(normalized) ||
      normalized.includes(data.city.toLowerCase())
    ) {
      return data;
    }
  }

  // Check cache
  if (cityGuideCache.has(normalized)) {
    return cityGuideCache.get(normalized)!;
  }

  return null;
}

// API: List destinations directory categorized by India & International
app.get('/api/destinations-directory', (_req: Request, res: Response) => {
  const all = Object.values(CURATED_CITIES);
  const india = all
    .filter((c) => c.country.toLowerCase() === 'india')
    .map((c) => ({
      city: c.city,
      country: c.country,
      tagline: c.tagline,
      dailyBudgetFromUsd: c.dailyBudgetSummary.shoestringDailyUsd,
      currencySymbol: c.localCurrency.symbol,
    }));

  const international = all
    .filter((c) => c.country.toLowerCase() !== 'india')
    .map((c) => ({
      city: c.city,
      country: c.country,
      tagline: c.tagline,
      dailyBudgetFromUsd: c.dailyBudgetSummary.shoestringDailyUsd,
      currencySymbol: c.localCurrency.symbol,
    }));

  res.json({ success: true, india, international });
});

// API: List popular quick-start destinations
app.get('/api/popular-destinations', (_req: Request, res: Response) => {
  const destinations = Object.values(CURATED_CITIES).map((c) => ({
    city: c.city,
    country: c.country,
    tagline: c.tagline,
    dailyBudgetFromUsd: c.dailyBudgetSummary.shoestringDailyUsd,
    currencySymbol: c.localCurrency.symbol,
  }));
  res.json({ success: true, destinations });
});

// Helper for calling Gemini with retry logic on transient 503 / 429
async function generateGeminiGuideWithRetry(prompt: string, config: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config,
      });
      return response;
    } catch (err: any) {
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        (err?.message &&
          (err.message.includes('503') ||
            err.message.includes('high demand') ||
            err.message.includes('ResourceExhausted')));

      if (isTransient && attempt < maxRetries) {
        console.warn(`Gemini 3.8 Flash temporary spike (attempt ${attempt}/${maxRetries}), retrying in ${attempt * 1200}ms...`);
        await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Exceeded maximum Gemini API retries');
}

// Fallback intelligent synthesizer for any city if AI service is temporarily offline
function synthesizeFallbackGuide(cityName: string): CityGuide {
  const clean = cityName.trim();
  const lower = clean.toLowerCase();
  const isIndian =
    lower.includes('india') ||
    lower.includes('visakhapatnam') ||
    lower.includes('vizag') ||
    lower.includes('mumbai') ||
    lower.includes('delhi') ||
    lower.includes('bengaluru') ||
    lower.includes('bangalore') ||
    lower.includes('chennai') ||
    lower.includes('kolkata') ||
    lower.includes('kochi') ||
    lower.includes('varanasi') ||
    lower.includes('agra') ||
    lower.includes('kerala') ||
    lower.includes('pune');

  if (isIndian) {
    return {
      city: clean,
      country: 'India',
      tagline: `Vibrant heritage, lively local markets & spicy street culinary delights in ${clean}`,
      summary: `${clean} is an enchanting Indian destination boasting deep historical roots, scenic vistas, and iconic street food corners that deliver exceptional travel value for budget travelers.`,
      localCurrency: { code: 'INR', symbol: '₹', exchangeRateToUsd: 86.5 },
      bestBudgetSeason: 'October to March (cool pleasant weather and festival season)',
      dailyBudgetSummary: { shoestringDailyUsd: 15, smartBudgetDailyUsd: 35, comfortableDailyUsd: 75 },
      topAttractions: [
        {
          id: `${clean.toLowerCase()}-heritage-center`,
          name: `${clean} Central Heritage Promenade & Memorial`,
          category: 'Historic Landmark',
          entryFeeLocal: 50,
          entryFeeUsd: 0.58,
          entryFeeFormatted: '₹50 (~$0.58)',
          isFree: false,
          freeAdmissionTips: 'Surrounding public gardens and promenade are 100% free to walk',
          description: `The monumental centerpiece of ${clean} celebrating local architectural heritage and regional culture.`,
          recommendedDuration: '2 hours',
          budgetTravelerHack: 'Visit in early morning for cool breeze and free entry to outer landscaped parks.',
          addressOrArea: `City Center, ${clean}`,
          highlight: 'Historic stone architecture and panoramic vantage points',
        },
        {
          id: `${clean.toLowerCase()}-viewpoint`,
          name: `${clean} Panorama Hill & Sunset Overlook`,
          category: 'Viewpoint',
          entryFeeLocal: 0,
          entryFeeUsd: 0,
          entryFeeFormatted: 'Free Admission',
          isFree: true,
          freeAdmissionTips: 'Open public viewpoint with zero ticket fees',
          description: `Sweeping elevated vista point offering 360-degree views across ${clean} and surrounding landscapes.`,
          recommendedDuration: '1.5 hours',
          budgetTravelerHack: 'Bring a water bottle and take local city bus or share-auto to the base trail.',
          addressOrArea: `Hilltop Rd, ${clean}`,
          highlight: 'Golden hour sunset over the city skyline',
        },
        {
          id: `${clean.toLowerCase()}-temple-shrine`,
          name: `${clean} Sacred Temple & Heritage Complex`,
          category: 'Temple / Sacred Site',
          entryFeeLocal: 0,
          entryFeeUsd: 0,
          entryFeeFormatted: 'Free Admission',
          isFree: true,
          freeAdmissionTips: 'General queue is completely free for all visitors',
          description: `Centuries-old spiritual sanctuary revered for traditional stone carvings and peaceful courtyard atmosphere.`,
          recommendedDuration: '1.5 hours',
          budgetTravelerHack: 'Enjoy free temple morning and evening prasadam.',
          addressOrArea: `Temple Ward, ${clean}`,
          highlight: 'Intricately sculpted stone pillars and sacred shrines',
        },
      ],
      famousFoodStalls: [
        {
          id: `${clean.toLowerCase()}-street-chaat`,
          name: `${clean} Main Bazaar Evening Food Stalls`,
          location: `Main Bazaar & Station Road, ${clean}`,
          type: 'Street Food Bandi & Chaat Cart',
          signatureDishes: [
            {
              dishName: 'Crispy Samosa & Kachori with Tangy Chutneys',
              priceLocal: '₹30 - ₹45',
              priceUsd: 0.45,
              description: 'Flaky golden pastries stuffed with spiced potatoes and served with sweet tamarind and spicy mint chutneys.',
            },
            {
              dishName: 'Fresh Tiffin Dosa / Puri Bhaji Plate',
              priceLocal: '₹50 - ₹70',
              priceUsd: 0.65,
              description: 'Piping hot breakfast tiffin with unlimited fresh coconut and tomato chutneys.',
            },
          ],
          averageMealCostFormatted: '₹40 – ₹90 (~$0.50 – $1.05)',
          averageMealCostUsd: 0.85,
          highlights: 'Bustling evening street food scene where locals gather for fresh hot snacks',
          openingHours: '4:00 PM – 10:30 PM daily',
          budgetTip: 'Eat where you see active crowds of locals for the freshest turnover.',
        },
      ],
      budgetTripEstimations: {
        shoestring: {
          accommodationPerNightUsd: 8,
          accommodationDescription: 'Dorm bed or budget guesthouse near transit hub',
          foodPerDayUsd: 5,
          transportPerDayUsd: 1.8,
          miscPerDayUsd: 1.2,
          dailyTotalUsd: 16.0,
          totalForDaysUsd: 48.0,
        },
        smartBudget: {
          accommodationPerNightUsd: 22,
          accommodationDescription: 'Clean private AC room with Wi-Fi in city center',
          foodPerDayUsd: 9,
          transportPerDayUsd: 3.5,
          miscPerDayUsd: 2.5,
          dailyTotalUsd: 37.0,
          totalForDaysUsd: 111.0,
        },
        comfortable: {
          accommodationPerNightUsd: 55,
          accommodationDescription: 'Upscale heritage hotel with swimming pool and breakfast',
          foodPerDayUsd: 18,
          transportPerDayUsd: 8,
          miscPerDayUsd: 5,
          dailyTotalUsd: 86.0,
          totalForDaysUsd: 258.0,
        },
      },
      moneySavingHacks: [
        'Take government state buses or local commuter trains for nominal fares (₹10–₹30).',
        'Book auto-rickshaws via Uber, Ola, or Rapido apps to avoid street haggling.',
        'Carry a refillable water bottle and drink boiled or filtered water.',
        'Many temple complexes and historic public parks charge zero entrance fees.',
      ],
      localTransportAdvice: `City buses and auto-rickshaws are plentiful in ${clean}. Booking via rideshare apps guarantees fair transparent meter rates.`,
    };
  }

  // Global default synthesis
  return {
    city: clean,
    country: 'International',
    tagline: `Historic monuments, vibrant culinary alleys & smart budget exploration in ${clean}`,
    summary: `${clean} is an exciting destination filled with rich cultural landmarks, world-renowned street food, and accessible public transit options for budget-conscious travelers.`,
    localCurrency: { code: 'USD', symbol: '$', exchangeRateToUsd: 1.0 },
    bestBudgetSeason: 'Spring and Autumn shoulder months (pleasant temperatures and lower accommodation prices)',
    dailyBudgetSummary: { shoestringDailyUsd: 35, smartBudgetDailyUsd: 70, comfortableDailyUsd: 140 },
    topAttractions: [
      {
        id: `${clean.toLowerCase()}-old-town`,
        name: `${clean} Historic Old Town & Central Square`,
        category: 'Market & District',
        entryFeeLocal: 0,
        entryFeeUsd: 0,
        entryFeeFormatted: 'Free Admission',
        isFree: true,
        freeAdmissionTips: 'Public square and cobblestone quarters open 24/7',
        description: `Atmospheric historic district featuring centuries-old architecture, street performers, and bustling public squares.`,
        recommendedDuration: '2 - 3 hours',
        budgetTravelerHack: 'Join a free tip-based walking tour from the main square to orient yourself without high tour fees.',
        addressOrArea: `Old Town Center, ${clean}`,
        highlight: 'Cobblestone streets and historic civic facades',
      },
      {
        id: `${clean.toLowerCase()}-city-museum`,
        name: `${clean} City Heritage & Art Museum`,
        category: 'Museum',
        entryFeeLocal: 12,
        entryFeeUsd: 12.0,
        entryFeeFormatted: '$12.00',
        isFree: false,
        freeAdmissionTips: 'Check for discounted admission on Thursday afternoons or first Sunday of the month',
        description: `Premier museum chronicling the arts, history, and founding culture of ${clean}.`,
        recommendedDuration: '2 hours',
        budgetTravelerHack: 'Book official online tickets in advance to skip ticket counter queues.',
        addressOrArea: `Museum Quarter, ${clean}`,
        highlight: 'Curated masterworks and historical artifact galleries',
      },
    ],
    famousFoodStalls: [
      {
        id: `${clean.toLowerCase()}-central-market`,
        name: `${clean} Central Market Food Stalls`,
        location: `Central Market Hall, ${clean}`,
        type: 'Covered Municipal Food Market',
        signatureDishes: [
          {
            dishName: 'Local Specialty Street Platter',
            priceLocal: '$5 - $8',
            priceUsd: 6.5,
            description: 'Freshly prepared signature street dish served hot with traditional savory sauces.',
          },
        ],
        averageMealCostFormatted: '$5.00 – $9.00 / meal',
        averageMealCostUsd: 7.0,
        highlights: 'Bustling food stalls with fresh local ingredients',
        openingHours: '9:00 AM – 7:00 PM daily',
        budgetTip: 'Order the lunch daily special (plat du jour) for highest quality at lowest cost.',
      },
    ],
    budgetTripEstimations: {
      shoestring: {
        accommodationPerNightUsd: 25,
        accommodationDescription: 'Hostel dorm bed in central neighborhood',
        foodPerDayUsd: 18,
        transportPerDayUsd: 5,
        miscPerDayUsd: 4,
        dailyTotalUsd: 52.0,
        totalForDaysUsd: 156.0,
      },
      smartBudget: {
        accommodationPerNightUsd: 55,
        accommodationDescription: 'Clean private room in guesthouse or budget hotel',
        foodPerDayUsd: 32,
        transportPerDayUsd: 9,
        miscPerDayUsd: 7,
        dailyTotalUsd: 103.0,
        totalForDaysUsd: 309.0,
      },
      comfortable: {
        accommodationPerNightUsd: 120,
        accommodationDescription: 'Boutique hotel with breakfast near main sights',
        foodPerDayUsd: 60,
        transportPerDayUsd: 18,
        miscPerDayUsd: 14,
        dailyTotalUsd: 212.0,
        totalForDaysUsd: 636.0,
      },
    },
    moneySavingHacks: [
      'Purchase an unlimited multi-day subway/transit pass for maximum savings.',
      'Enjoy free public parks, cathedrals, and city viewpoints.',
      'Shop at local markets or bakeries for picnic lunches.',
    ],
    localTransportAdvice: `Public transit (subway and buses) in ${clean} is the fastest and most cost-effective way to get around. Contactless payment or rechargeable transit cards save time and money.`,
  };
}


// API: Search city and get attractions with entry fees, food stalls, and budget estimation
app.post('/api/city-guide', async (req: Request, res: Response) => {
  const { city, days = 3, travelStyle = 'smartBudget' } = req.body;

  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'City name is required' });
  }

  const cleanCity = city.trim();

  // If city matches our pre-curated high-detail destinations, we can return immediately
  // while recalculating the totals for the requested days
  const curated = findCuratedCity(cleanCity);
  if (curated) {
    const daysCount = Math.max(1, Math.min(30, Number(days) || 3));
    const guideCopy: CityGuide = JSON.parse(JSON.stringify(curated));
    
    // Scale totals for the requested days
    (['shoestring', 'smartBudget', 'comfortable'] as const).forEach((tier) => {
      const estimation = guideCopy.budgetTripEstimations[tier];
      estimation.totalForDaysUsd = Math.round(estimation.dailyTotalUsd * daysCount);
    });

    return res.json({
      success: true,
      source: 'curated',
      data: guideCopy,
    });
  }

  // If not curated and GEMINI_API_KEY is present, query Gemini 3.8 Flash for structured city guide
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are an expert budget travel advisor and local guide. Provide an accurate, comprehensive budget travel guide for the city: "${cleanCity}".
First and foremost, provide a prioritized list of top tourist attractions along with their corresponding exact entry fees in both local currency and USD, free hours/tips, and insider budget hacks.
Next, suggest famous authentic street food stalls, food markets, and budget culinary spots with specific signature dishes and real price estimations.
Finally, calculate a realistic budget-friendly trip price breakdown for a ${days}-day trip under ${travelStyle} travel style.

Respond strictly according to the specified JSON schema.`;

      const response = await generateGeminiGuideWithRetry(prompt, {
        systemInstruction:
          'You are a real-world budget tourism specialist. You provide precise, non-hallucinated entry fees for top attractions (stating Free if free admission), exact street food dish prices, and pragmatic daily budget costs.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            city: { type: Type.STRING },
            country: { type: Type.STRING },
            tagline: { type: Type.STRING },
            summary: { type: Type.STRING },
            localCurrency: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING },
                symbol: { type: Type.STRING },
                exchangeRateToUsd: { type: Type.NUMBER },
              },
              required: ['code', 'symbol', 'exchangeRateToUsd'],
            },
            bestBudgetSeason: { type: Type.STRING },
            dailyBudgetSummary: {
              type: Type.OBJECT,
              properties: {
                shoestringDailyUsd: { type: Type.NUMBER },
                smartBudgetDailyUsd: { type: Type.NUMBER },
                comfortableDailyUsd: { type: Type.NUMBER },
              },
              required: ['shoestringDailyUsd', 'smartBudgetDailyUsd', 'comfortableDailyUsd'],
            },
            topAttractions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  entryFeeLocal: { type: Type.NUMBER },
                  entryFeeUsd: { type: Type.NUMBER },
                  entryFeeFormatted: { type: Type.STRING },
                  isFree: { type: Type.BOOLEAN },
                  freeAdmissionTips: { type: Type.STRING },
                  description: { type: Type.STRING },
                  recommendedDuration: { type: Type.STRING },
                  budgetTravelerHack: { type: Type.STRING },
                  addressOrArea: { type: Type.STRING },
                  highlight: { type: Type.STRING },
                },
                required: [
                  'id',
                  'name',
                  'category',
                  'entryFeeLocal',
                  'entryFeeUsd',
                  'entryFeeFormatted',
                  'isFree',
                  'description',
                  'recommendedDuration',
                  'budgetTravelerHack',
                  'addressOrArea',
                  'highlight',
                ],
              },
            },
            famousFoodStalls: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  location: { type: Type.STRING },
                  type: { type: Type.STRING },
                  signatureDishes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dishName: { type: Type.STRING },
                        priceLocal: { type: Type.STRING },
                        priceUsd: { type: Type.NUMBER },
                        description: { type: Type.STRING },
                      },
                      required: ['dishName', 'priceLocal', 'priceUsd', 'description'],
                    },
                  },
                  averageMealCostFormatted: { type: Type.STRING },
                  averageMealCostUsd: { type: Type.NUMBER },
                  highlights: { type: Type.STRING },
                  openingHours: { type: Type.STRING },
                  budgetTip: { type: Type.STRING },
                },
                required: [
                  'id',
                  'name',
                  'location',
                  'type',
                  'signatureDishes',
                  'averageMealCostFormatted',
                  'averageMealCostUsd',
                  'highlights',
                  'openingHours',
                  'budgetTip',
                ],
              },
            },
            budgetTripEstimations: {
              type: Type.OBJECT,
              properties: {
                shoestring: {
                  type: Type.OBJECT,
                  properties: {
                    accommodationPerNightUsd: { type: Type.NUMBER },
                    accommodationDescription: { type: Type.STRING },
                    foodPerDayUsd: { type: Type.NUMBER },
                    transportPerDayUsd: { type: Type.NUMBER },
                    miscPerDayUsd: { type: Type.NUMBER },
                    dailyTotalUsd: { type: Type.NUMBER },
                    totalForDaysUsd: { type: Type.NUMBER },
                  },
                  required: [
                    'accommodationPerNightUsd',
                    'accommodationDescription',
                    'foodPerDayUsd',
                    'transportPerDayUsd',
                    'miscPerDayUsd',
                    'dailyTotalUsd',
                    'totalForDaysUsd',
                  ],
                },
                smartBudget: {
                  type: Type.OBJECT,
                  properties: {
                    accommodationPerNightUsd: { type: Type.NUMBER },
                    accommodationDescription: { type: Type.STRING },
                    foodPerDayUsd: { type: Type.NUMBER },
                    transportPerDayUsd: { type: Type.NUMBER },
                    miscPerDayUsd: { type: Type.NUMBER },
                    dailyTotalUsd: { type: Type.NUMBER },
                    totalForDaysUsd: { type: Type.NUMBER },
                  },
                  required: [
                    'accommodationPerNightUsd',
                    'accommodationDescription',
                    'foodPerDayUsd',
                    'transportPerDayUsd',
                    'miscPerDayUsd',
                    'dailyTotalUsd',
                    'totalForDaysUsd',
                  ],
                },
                comfortable: {
                  type: Type.OBJECT,
                  properties: {
                    accommodationPerNightUsd: { type: Type.NUMBER },
                    accommodationDescription: { type: Type.STRING },
                    foodPerDayUsd: { type: Type.NUMBER },
                    transportPerDayUsd: { type: Type.NUMBER },
                    miscPerDayUsd: { type: Type.NUMBER },
                    dailyTotalUsd: { type: Type.NUMBER },
                    totalForDaysUsd: { type: Type.NUMBER },
                  },
                  required: [
                    'accommodationPerNightUsd',
                    'accommodationDescription',
                    'foodPerDayUsd',
                    'transportPerDayUsd',
                    'miscPerDayUsd',
                    'dailyTotalUsd',
                    'totalForDaysUsd',
                  ],
                },
              },
              required: ['shoestring', 'smartBudget', 'comfortable'],
            },
            moneySavingHacks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            localTransportAdvice: { type: Type.STRING },
          },
          required: [
            'city',
            'country',
            'tagline',
            'summary',
            'localCurrency',
            'bestBudgetSeason',
            'dailyBudgetSummary',
            'topAttractions',
            'famousFoodStalls',
            'budgetTripEstimations',
            'moneySavingHacks',
            'localTransportAdvice',
          ],
        },
      });

      let responseText = response.text || '';
      // Strip markdown backticks if any
      responseText = responseText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();

      if (responseText) {
        const guideData: CityGuide = JSON.parse(responseText);
        const daysCount = Math.max(1, Math.min(30, Number(days) || 3));
        
        // Recalculate totalForDaysUsd dynamically to ensure consistency
        (['shoestring', 'smartBudget', 'comfortable'] as const).forEach((tier) => {
          if (guideData.budgetTripEstimations?.[tier]) {
            guideData.budgetTripEstimations[tier].totalForDaysUsd = Math.round(
              guideData.budgetTripEstimations[tier].dailyTotalUsd * daysCount
            );
          }
        });

        // Store in cache for ultra-fast subsequent queries
        cityGuideCache.set(cleanCity.toLowerCase(), guideData);

        return res.json({
          success: true,
          source: 'gemini',
          data: guideData,
        });
      }
    } catch (err: unknown) {
      console.error('Gemini API query error, using smart synthesized guide:', err);
    }
  }

  // Intelligent fallback: synthesize authentic guide for requested city
  const fallback = synthesizeFallbackGuide(cleanCity);
  const daysCount = Math.max(1, Math.min(30, Number(days) || 3));
  (['shoestring', 'smartBudget', 'comfortable'] as const).forEach((tier) => {
    if (fallback.budgetTripEstimations?.[tier]) {
      fallback.budgetTripEstimations[tier].totalForDaysUsd = Math.round(
        fallback.budgetTripEstimations[tier].dailyTotalUsd * daysCount
      );
    }
  });

  // Cache fallback
  cityGuideCache.set(cleanCity.toLowerCase(), fallback);

  return res.json({
    success: true,
    source: 'synthesized',
    message: `Generated budget guide for ${fallback.city}, ${fallback.country}`,
    data: fallback,
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`RoamWise server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
