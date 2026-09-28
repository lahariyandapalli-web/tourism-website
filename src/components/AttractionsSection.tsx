import React, { useState } from 'react';
import { Attraction, SupportedCurrency } from '../types/travel';
import { formatPriceInCurrency } from '../utils/currency';
import {
  Ticket,
  Clock,
  Lightbulb,
  MapPin,
  CheckCircle2,
  PlusCircle,
  Tag,
  Landmark,
} from 'lucide-react';

interface AttractionsSectionProps {
  cityName: string;
  countryName: string;
  attractions: Attraction[];
  selectedAttractionIds: Set<string>;
  onToggleAttraction: (attraction: Attraction) => void;
  currency: SupportedCurrency;
}

export const AttractionsSection: React.FC<AttractionsSectionProps> = ({
  cityName,
  countryName,
  attractions,
  selectedAttractionIds,
  onToggleAttraction,
  currency,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filter categories
  const categories = [
    { id: 'all', label: 'All Attractions' },
    { id: 'free', label: 'Free Admission' },
    { id: 'historic', label: 'Historic & Landmarks' },
    { id: 'sacred', label: 'Temples & Sacred' },
    { id: 'nature', label: 'Nature & Views' },
  ];

  const filteredAttractions = attractions.filter((attraction) => {
    if (filterCategory === 'free') return attraction.isFree;
    if (filterCategory === 'historic') {
      return (
        attraction.category === 'Historic Landmark' ||
        attraction.category === 'Architectural Marvel' ||
        attraction.category === 'Museum'
      );
    }
    if (filterCategory === 'sacred') {
      return attraction.category === 'Temple / Sacred Site';
    }
    if (filterCategory === 'nature') {
      return (
        attraction.category === 'Natural Wonder' ||
        attraction.category === 'Viewpoint' ||
        attraction.category === 'Market & District'
      );
    }
    return true;
  });

  // Calculate live selected entry fee total
  const selectedAttractions = attractions.filter((a) =>
    selectedAttractionIds.has(a.id)
  );
  const totalSelectedFeeUsd = selectedAttractions.reduce(
    (sum, a) => sum + (a.entryFeeUsd || 0),
    0
  );
  const freeAttractionsCount = attractions.filter((a) => a.isFree).length;

  return (
    <section id="attractions-section" className="py-12 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-16">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium mb-1">
            <span>Priority Sightseeing Guide</span>
            <span aria-hidden="true">·</span>
            <span>{cityName}, {countryName}</span>
            <span aria-hidden="true">·</span>
            <span>{attractions.length} Famous Attractions</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-stone-900 font-display">
            Top Attractions & Entry Fees
          </h2>
          <p className="text-sm md:text-base text-stone-600 mt-1 max-w-2xl">
            Verified admission prices, zero-cost admission hours, and budget traveler tips. Check items to automatically calculate your trip sightseeing total.
          </p>
        </div>

        {/* Live Calculation Badge / Summary Box */}
        <div className="bg-stone-900 text-white rounded-xl p-4 shadow-sm flex items-center gap-4 min-w-[280px] shrink-0 border border-stone-800">
          <div className="w-10 h-10 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Selected Sightseeing Total
            </div>
            <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">
              {formatPriceInCurrency(totalSelectedFeeUsd, currency)}
            </div>
            <div className="text-[11px] text-stone-300">
              {selectedAttractions.length} of {attractions.length} attractions chosen ({freeAttractionsCount} free in city)
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs (Interactive Segmented Control) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100/90 rounded-lg border border-stone-200/80 mb-8 max-w-fit">
        {categories.map((tab) => {
          const isActive = filterCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Attractions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAttractions.map((attraction, idx) => {
          const isSelected = selectedAttractionIds.has(attraction.id);

          return (
            <div
              key={attraction.id}
              className={`relative bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-amber-500/80 ring-1 ring-amber-500/30'
                  : 'border-stone-200/90 hover:border-stone-300'
              }`}
            >
              {/* Card Header & Title */}
              <div className="p-5 pb-3">
                {/* Clean unboxed metadata with bullet separators (Zero-Pill Rule) */}
                <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Landmark className="w-3.5 h-3.5 text-stone-400" />
                    <span>{attraction.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{attraction.recommendedDuration}</span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">
                    #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 tracking-tight leading-snug mb-2 font-display">
                  {attraction.name}
                </h3>

                {/* Prominent Entry Fee Display */}
                <div className="my-3 p-3 bg-stone-50 rounded-lg border border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-stone-500 shrink-0" />
                    <div>
                      <span className="text-[11px] text-stone-500 font-medium block">
                        Admission Fee
                      </span>
                      <span
                        className={`text-sm font-bold font-mono tabular-nums ${
                          attraction.isFree ? 'text-emerald-700' : 'text-stone-900'
                        }`}
                      >
                        {attraction.isFree
                          ? 'FREE ADMISSION'
                          : `${attraction.entryFeeFormatted}`}
                      </span>
                    </div>
                  </div>

                  {!attraction.isFree && currency !== 'USD' && (
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block">In {currency}</span>
                      <span className="text-xs font-semibold text-stone-700 font-mono tabular-nums">
                        {formatPriceInCurrency(attraction.entryFeeUsd, currency)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Attraction Description */}
                <p className="text-xs md:text-sm text-stone-600 leading-relaxed mb-3">
                  {attraction.description}
                </p>

                {/* Free Admission Hours / Conditions if applicable */}
                {attraction.freeAdmissionTips && (
                  <div className="text-xs bg-emerald-50/70 border border-emerald-200/60 rounded-lg p-2.5 mb-3 text-emerald-900 flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="leading-snug">{attraction.freeAdmissionTips}</span>
                  </div>
                )}

                {/* Budget Traveler Hack */}
                <div className="text-xs bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5 mb-3 text-amber-950 flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong className="font-semibold text-amber-900">Budget Hack: </strong>
                    <span>{attraction.budgetTravelerHack}</span>
                  </div>
                </div>

                {/* Location / Area */}
                <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{attraction.addressOrArea}</span>
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="p-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onToggleAttraction(attraction)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 hover:bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-200'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-stone-950" />
                      <span>Added to Budget ({attraction.isFree ? 'Free' : formatPriceInCurrency(attraction.entryFeeUsd, currency)})</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-stone-600" />
                      <span>Add to My Trip Budget</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
