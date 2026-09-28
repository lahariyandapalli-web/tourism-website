import React from 'react';
import { SupportedCurrency } from '../types/travel';
import { CURRENCY_RATES } from '../utils/currency';
import { Compass, Bookmark, DollarSign } from 'lucide-react';

interface NavbarProps {
  currentCurrency: SupportedCurrency;
  onCurrencyChange: (c: SupportedCurrency) => void;
  savedAttractionsCount: number;
  onOpenSavedDrawer: () => void;
  activeCityName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency,
  onCurrencyChange,
  savedAttractionsCount,
  onOpenSavedDrawer,
  activeCityName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fafaf8]/95 backdrop-blur-md border-b border-stone-200/80 px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-display font-bold text-lg shadow-sm">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-stone-900 font-display">
            RoamWise
          </span>
        </a>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <a
            href="#attractions-section"
            className="hover:text-stone-950 transition-colors"
          >
            Attractions & Entry Fees
          </a>
          <a
            href="#food-stalls-section"
            className="hover:text-stone-950 transition-colors"
          >
            Food Stalls & Menus
          </a>
          <a
            href="#budget-estimator-section"
            className="hover:text-stone-950 transition-colors"
          >
            Budget Estimator
          </a>
          <a
            href="#travel-hacks-section"
            className="hover:text-stone-950 transition-colors"
          >
            Local Money Hacks
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1.5 bg-stone-100/90 rounded-md px-2.5 py-1.5 border border-stone-200 text-xs font-medium text-stone-700">
            <DollarSign className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={currentCurrency}
              onChange={(e) => onCurrencyChange(e.target.value as SupportedCurrency)}
              className="bg-transparent border-none text-stone-800 focus:outline-none cursor-pointer font-semibold"
              aria-label="Select currency"
            >
              {Object.keys(CURRENCY_RATES).map((code) => (
                <option key={code} value={code}>
                  {code} ({CURRENCY_RATES[code as SupportedCurrency].symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Saved Trip & Budget Drawer trigger */}
          <button
            onClick={onOpenSavedDrawer}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-all shadow-sm cursor-pointer whitespace-nowrap"
            title="View saved attractions and budget tally"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">My Itinerary</span>
            {savedAttractionsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 text-[11px] font-bold bg-amber-400 text-stone-950 rounded">
                {savedAttractionsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
