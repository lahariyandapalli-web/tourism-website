import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CityOverviewBanner } from './components/CityOverviewBanner';
import { AttractionsSection } from './components/AttractionsSection';
import { FoodStallsSection } from './components/FoodStallsSection';
import { BudgetEstimatorSection } from './components/BudgetEstimatorSection';
import { TravelHacksSection } from './components/TravelHacksSection';
import { SavedTripDrawer } from './components/SavedTripDrawer';
import { ChatbotWidget } from './components/ChatbotWidget';
import { Footer } from './components/Footer';
import { CURATED_CITIES } from './data/curatedDestinations';
import {
  CityGuide,
  SupportedCurrency,
  TravelStyle,
  Attraction,
  FoodStall,
} from './types/travel';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [guide, setGuide] = useState<CityGuide>(CURATED_CITIES.visakhapatnam || CURATED_CITIES.kyoto);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const [selectedDays, setSelectedDays] = useState<number>(3);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('smartBudget');
  const [currentCurrency, setCurrentCurrency] = useState<SupportedCurrency>('INR');

  // Set of selected attractions for live entry fee calculation
  const [selectedAttractionIds, setSelectedAttractionIds] = useState<Set<string>>(
    new Set(['vizag-kursura-submarine', 'vizag-kailasagiri', 'vizag-borra-caves'])
  );

  // Set of bookmarked food stalls
  const [savedFoodStallIds, setSavedFoodStallIds] = useState<Set<string>>(
    new Set(['vizag-rk-beach-punugulu'])
  );

  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);


  // Auto-dismiss feedback notifications
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const handleSearchCity = async (cityName: string) => {
    setIsLoading(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/city-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: cityName,
          days: selectedDays,
          travelStyle,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGuide(json.data);
        
        // Pre-select the first 3 attractions for this new destination
        const newIds = new Set<string>(
          json.data.topAttractions.slice(0, 3).map((a: Attraction) => a.id)
        );
        setSelectedAttractionIds(newIds);
        setSavedFoodStallIds(new Set<string>());

        setFeedbackMessage({
          text: `Loaded budget guide for ${json.data.city}, ${json.data.country}!`,
          type: 'success',
        });

        // Smooth scroll to attractions section as specifically requested:
        // "first the it should show. a list of top attractions along with their corresponding entry fees."
        setTimeout(() => {
          const el = document.getElementById('attractions-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      } else {
        throw new Error(json.error || 'Could not fetch destination details');
      }
    } catch (err: unknown) {
      console.error('Search error:', err);
      // Fallback gracefully to curated city if name matches or Kyoto
      const normalizedQuery = cityName.toLowerCase().trim();
      const matchingCurated = Object.values(CURATED_CITIES).find(
        (c) =>
          c.city.toLowerCase() === normalizedQuery ||
          normalizedQuery.includes(c.city.toLowerCase()) ||
          c.country.toLowerCase() === normalizedQuery ||
          (normalizedQuery.includes('vizag') && c.city.toLowerCase().includes('visakhapatnam'))
      );
      if (matchingCurated) {
        setGuide(matchingCurated);
        setSelectedAttractionIds(
          new Set(matchingCurated.topAttractions.slice(0, 3).map((a) => a.id))
        );
        setFeedbackMessage({
          text: `Loaded offline guide for ${matchingCurated.city}, ${matchingCurated.country}!`,
          type: 'success',
        });
      } else {
        setFeedbackMessage({
          text: `Showing featured guide for ${guide.city}.`,
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAttraction = (attraction: Attraction) => {
    setSelectedAttractionIds((prev) => {
      const next = new Set(prev);
      if (next.has(attraction.id)) {
        next.delete(attraction.id);
      } else {
        next.add(attraction.id);
      }
      return next;
    });
  };

  const handleBookmarkFoodStall = (stall: FoodStall) => {
    setSavedFoodStallIds((prev) => {
      const next = new Set(prev);
      if (next.has(stall.id)) {
        next.delete(stall.id);
        setFeedbackMessage({
          text: `Removed ${stall.name} from food crawl`,
          type: 'success',
        });
      } else {
        next.add(stall.id);
        setFeedbackMessage({
          text: `Added ${stall.name} to food crawl wishlist!`,
          type: 'success',
        });
      }
      return next;
    });
  };

  const handleRemoveAttraction = (id: string) => {
    setSelectedAttractionIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleRemoveFoodStall = (id: string) => {
    setSavedFoodStallIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Filter objects for the drawer and estimator
  const selectedAttractionsList = guide.topAttractions.filter((a) =>
    selectedAttractionIds.has(a.id)
  );
  const savedFoodStallsList = guide.famousFoodStalls.filter((f) =>
    savedFoodStallIds.has(f.id)
  );

  // Compute total trip estimated cost
  const tier = guide.budgetTripEstimations[travelStyle];
  const customSightseeingFeeUsd = selectedAttractionsList.reduce(
    (sum, a) => sum + (a.entryFeeUsd || 0),
    0
  );
  const totalTripEstimatedCostUsd =
    (tier.accommodationPerNightUsd +
      tier.foodPerDayUsd +
      tier.transportPerDayUsd +
      tier.miscPerDayUsd) *
      selectedDays +
    (selectedAttractionsList.length > 0 ? customSightseeingFeeUsd : 30);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8] text-stone-900 selection:bg-amber-400 selection:text-stone-950">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 ${
            feedbackMessage.type === 'success'
              ? 'bg-stone-900 text-white border border-stone-800'
              : 'bg-red-900 text-white border border-red-800'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Top Bar (Universal Constitution) */}
      <Navbar
        currentCurrency={currentCurrency}
        onCurrencyChange={setCurrentCurrency}
        savedAttractionsCount={selectedAttractionIds.size + savedFoodStallIds.size}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        activeCityName={guide.city}
      />

      {/* Hero with Search and Controls */}
      <div id="hero">
        <HeroSection
          onSearchCity={handleSearchCity}
          isLoading={isLoading}
          selectedDays={selectedDays}
          onDaysChange={setSelectedDays}
          travelStyle={travelStyle}
          onTravelStyleChange={setTravelStyle}
          currentCityName={guide.city}
        />
      </div>

      {/* City Overview & Currency Economics Banner */}
      <CityOverviewBanner guide={guide} currency={currentCurrency} />

      <main className="flex-1">
        {/* FIRST & PROMINENT: Top Attractions Along with Entry Fees */}
        <AttractionsSection
          cityName={guide.city}
          countryName={guide.country}
          attractions={guide.topAttractions}
          selectedAttractionIds={selectedAttractionIds}
          onToggleAttraction={handleToggleAttraction}
          currency={currentCurrency}
        />

        {/* SECOND: Famous Food Stalls with Dishes and Price Estimations */}
        <FoodStallsSection
          cityName={guide.city}
          foodStalls={guide.famousFoodStalls}
          currency={currentCurrency}
          onBookmarkFoodStall={handleBookmarkFoodStall}
          savedStallIds={savedFoodStallIds}
        />

        {/* THIRD: Budget-Friendly Trip Price Estimation Breakdown */}
        <BudgetEstimatorSection
          guide={guide}
          selectedDays={selectedDays}
          onDaysChange={setSelectedDays}
          travelStyle={travelStyle}
          onTravelStyleChange={setTravelStyle}
          selectedAttractions={selectedAttractionsList}
          currency={currentCurrency}
        />

        {/* FOURTH: Local Money-Saving Hacks & Transit Secrets */}
        <TravelHacksSection guide={guide} />
      </main>

      {/* Saved Itinerary and Budget Tally Drawer */}
      <SavedTripDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        cityName={guide.city}
        selectedAttractions={selectedAttractionsList}
        onRemoveAttraction={handleRemoveAttraction}
        savedFoodStalls={savedFoodStallsList}
        onRemoveFoodStall={handleRemoveFoodStall}
        currency={currentCurrency}
        totalTripEstimatedCostUsd={totalTripEstimatedCostUsd}
        days={selectedDays}
      />

      {/* n8n Powered AI Travel Assistant Chatbot Widget */}
      <ChatbotWidget activeCityName={guide.city} />

      {/* Footer */}
      <Footer />

    </div>
  );
}
