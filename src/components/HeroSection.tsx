import React, { useState } from 'react';
import { Search, MapPin, Calendar, Wallet, Sparkles, Loader2 } from 'lucide-react';
import { TravelStyle } from '../types/travel';

interface HeroSectionProps {
  onSearchCity: (city: string) => void;
  isLoading: boolean;
  selectedDays: number;
  onDaysChange: (days: number) => void;
  travelStyle: TravelStyle;
  onTravelStyleChange: (style: TravelStyle) => void;
  currentCityName: string;
}

const INDIA_CITIES = [
  { name: 'Visakhapatnam', badge: 'Submarine & RK Beach' },
  { name: 'Goa', badge: 'Beaches & Portuguese Forts' },
  { name: 'Hyderabad', badge: 'Charminar & Dum Biryani' },
  { name: 'Jaipur', badge: 'Hilltop Forts & Palaces' },
  { name: 'Mumbai', badge: 'Marine Drive & Street Chaat' },
  { name: 'Delhi', badge: 'Mughal Monuments & Chandni Chowk' },
];

const INTERNATIONAL_CITIES = [
  { name: 'Kyoto', country: 'Japan', badge: 'Temples & Stalls' },
  { name: 'Rome', country: 'Italy', badge: 'Colosseum & €4 Pasta' },
  { name: 'Bangkok', country: 'Thailand', badge: 'Night Markets & Wats' },
  { name: 'Paris', country: 'France', badge: 'Louvre & Bakeries' },
  { name: 'Tokyo', country: 'Japan', badge: 'Shibuya & Ramen' },
  { name: 'London', country: 'UK', badge: 'Free Museums & Markets' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearchCity,
  isLoading,
  selectedDays,
  onDaysChange,
  travelStyle,
  onTravelStyleChange,
  currentCityName,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [regionTab, setRegionTab] = useState<'india' | 'international'>('india');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() && !isLoading) {
      onSearchCity(searchInput.trim());
    }
  };


  return (
    <section className="relative overflow-hidden bg-stone-900 text-stone-100 border-b border-stone-800">
      {/* Background Hero Image with measured scrim */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/src/assets/images/hero_travel_explorer_1790578218762.jpg"
          alt="Scenic historic city skyline with traveler at sunrise"
          className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/40" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        {/* Subtle sub-heading */}
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Budget Travel & Attraction Explorer</span>
        </div>

        {/* Marquee Headline */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl leading-[1.15] mb-5 font-display">
          Tour any city with verified attraction fees & legendary street food.
        </h1>

        <p className="text-base md:text-lg text-stone-300 max-w-2xl font-normal leading-relaxed mb-8">
          Instant entry fee breakdowns, free admission days, iconic street food stalls with real dish prices, and a budget calculator for smart travelers.
        </p>

        {/* Interactive Search Box */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 md:p-4 shadow-2xl border border-stone-200/40 max-w-3xl text-stone-900">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter any destination worldwide (e.g. Kyoto, Rome, Bangkok, Paris, Istanbul)..."
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-stone-900 transition-all"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchInput.trim()}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Explore City</span>
                </>
              )}
            </button>
          </form>

          {/* Trip configuration selectors */}
          <div className="mt-3.5 pt-3.5 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
            {/* Duration Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span className="font-medium text-stone-700">Trip Duration:</span>
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-md border border-stone-200">
                {[1, 2, 3, 5, 7].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => onDaysChange(days)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      selectedDays === days
                        ? 'bg-white text-stone-950 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {days} {days === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Style Selector */}
            <div className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-stone-500" />
              <span className="font-medium text-stone-700">Travel Style:</span>
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-md border border-stone-200">
                <button
                  type="button"
                  onClick={() => onTravelStyleChange('shoestring')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                    travelStyle === 'shoestring'
                      ? 'bg-white text-stone-950 font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Hostels, street food, walking & public transit"
                >
                  Shoestring
                </button>
                <button
                  type="button"
                  onClick={() => onTravelStyleChange('smartBudget')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                    travelStyle === 'smartBudget'
                      ? 'bg-white text-stone-950 font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Budget hotels/private rooms, local eateries, combo day passes"
                >
                  Smart Budget
                </button>
                <button
                  type="button"
                  onClick={() => onTravelStyleChange('comfortable')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                    travelStyle === 'comfortable'
                      ? 'bg-white text-stone-950 font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Boutique stays, curated dining & full attraction access"
                >
                  Comfortable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick-Pick Destinations categorized by India & International */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-2.5">
            <span className="text-stone-400 text-xs font-semibold uppercase tracking-wider">Explore Destinations:</span>
            <div className="inline-flex bg-stone-800/90 p-1 rounded-lg border border-stone-700/80 text-xs">
              <button
                type="button"
                onClick={() => setRegionTab('india')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  regionTab === 'india'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                🇮🇳 India Destinations
              </button>
              <button
                type="button"
                onClick={() => setRegionTab('international')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  regionTab === 'international'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                🌍 International Destinations
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(regionTab === 'india' ? INDIA_CITIES : INTERNATIONAL_CITIES).map((c) => {
              const isCurrent = currentCityName.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.name}
                  onClick={() => onSearchCity(c.name)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-amber-400 text-stone-950 font-bold shadow-sm ring-1 ring-amber-300'
                      : 'bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 border border-stone-700'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-75">· {c.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

