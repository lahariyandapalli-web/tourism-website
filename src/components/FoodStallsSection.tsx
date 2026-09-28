import React from 'react';
import { FoodStall, SupportedCurrency } from '../types/travel';
import { formatPriceInCurrency } from '../utils/currency';
import { Utensils, MapPin, Clock, DollarSign, Sparkles, ChefHat } from 'lucide-react';

interface FoodStallsSectionProps {
  cityName: string;
  foodStalls: FoodStall[];
  currency: SupportedCurrency;
  onBookmarkFoodStall?: (stall: FoodStall) => void;
  savedStallIds?: Set<string>;
}

export const FoodStallsSection: React.FC<FoodStallsSectionProps> = ({
  cityName,
  foodStalls,
  currency,
  onBookmarkFoodStall,
  savedStallIds = new Set(),
}) => {
  return (
    <section id="food-stalls-section" className="py-14 bg-stone-100/60 border-y border-stone-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              <span>Authentic Street Food & Budget Dining</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-stone-900 font-display">
              Famous Food Stalls & Menu Prices
            </h2>
            <p className="text-sm md:text-base text-stone-600 mt-1 max-w-2xl">
              Local street legends, night markets, and historic counters in {cityName} where you can feast on iconic dishes without breaking your travel budget.
            </p>
          </div>

          {/* Street food market visual banner */}
          <div className="relative rounded-xl overflow-hidden shadow-md max-w-xs hidden lg:block shrink-0 border border-stone-300">
            <img
              src={
                cityName.toLowerCase().includes('visakhapatnam') ||
                cityName.toLowerCase().includes('vizag') ||
                cityName.toLowerCase().includes('hyderabad') ||
                cityName.toLowerCase().includes('jaipur') ||
                cityName.toLowerCase().includes('goa')
                  ? '/src/assets/images/andhra_punugulu_stall_1790579540087.jpg'
                  : '/src/assets/images/street_food_market_stall_1790578247436.jpg'
              }
              alt="Authentic street food market stall"
              className="w-full h-28 object-cover filter brightness-95"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[11px] font-semibold text-white tracking-wide">
                Verified Local Street Food Prices
              </span>
            </div>
          </div>
        </div>

        {/* Food Stalls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {foodStalls.map((stall) => {
            const isBookmarked = savedStallIds.has(stall.id);

            return (
              <div
                key={stall.id}
                className="bg-white rounded-xl border border-stone-200/90 shadow-xs flex flex-col justify-between overflow-hidden hover:shadow-md transition-all"
              >
                <div className="p-5">
                  {/* Type & Location */}
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2 font-medium">
                    <span className="text-amber-800 font-semibold">{stall.type}</span>
                    <div className="flex items-center gap-1 font-mono text-stone-700">
                      <DollarSign className="w-3 h-3 text-stone-400" />
                      <span>Avg: {formatPriceInCurrency(stall.averageMealCostUsd, currency)}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 tracking-tight leading-snug mb-1 font-display">
                    {stall.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{stall.location}</span>
                  </div>

                  {/* Highlights */}
                  <p className="text-xs text-stone-600 mb-4 italic leading-relaxed">
                    "{stall.highlights}"
                  </p>

                  {/* Signature Dishes List */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                      <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                      <span>Must-Try Signature Dishes</span>
                    </div>

                    <div className="space-y-2.5">
                      {stall.signatureDishes.map((dish, i) => (
                        <div
                          key={i}
                          className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2 font-semibold text-stone-900 mb-1">
                            <span className="leading-snug">{dish.dishName}</span>
                            <div className="text-right shrink-0">
                              <span className="text-amber-700 font-mono font-bold block">
                                {dish.priceLocal}
                              </span>
                              {currency !== 'USD' && (
                                <span className="text-[10px] text-stone-400 font-mono block">
                                  ~{formatPriceInCurrency(dish.priceUsd, currency)}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-stone-500 leading-snug">
                            {dish.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insider Foodie Tip */}
                  <div className="text-xs bg-amber-50/80 border border-amber-200/60 rounded-lg p-2.5 text-amber-950 mb-3">
                    <strong className="font-semibold text-amber-900">Foodie Secret: </strong>
                    <span className="leading-relaxed">{stall.budgetTip}</span>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                    <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{stall.openingHours}</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                {onBookmarkFoodStall && (
                  <div className="p-3 bg-stone-50/80 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => onBookmarkFoodStall(stall)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isBookmarked
                          ? 'bg-stone-900 text-amber-400'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isBookmarked ? 'Saved to Food Crawl' : 'Add to My Food Crawl'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
