import React from 'react';
import {
  CityGuide,
  SupportedCurrency,
  TravelStyle,
  Attraction,
} from '../types/travel';
import { formatPriceInCurrency } from '../utils/currency';
import {
  Calculator,
  Bed,
  UtensilsCrossed,
  Ticket,
  Bus,
  ShieldCheck,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface BudgetEstimatorSectionProps {
  guide: CityGuide;
  selectedDays: number;
  onDaysChange: (days: number) => void;
  travelStyle: TravelStyle;
  onTravelStyleChange: (style: TravelStyle) => void;
  selectedAttractions: Attraction[];
  currency: SupportedCurrency;
}

export const BudgetEstimatorSection: React.FC<BudgetEstimatorSectionProps> = ({
  guide,
  selectedDays,
  onDaysChange,
  travelStyle,
  onTravelStyleChange,
  selectedAttractions,
  currency,
}) => {
  const currentTier = guide.budgetTripEstimations[travelStyle];

  // Calculate actual sightseeing fee based on user selection if any;
  // otherwise fallback to typical average attraction admission for the chosen days
  const customSightseeingFeeUsd = selectedAttractions.reduce(
    (sum, a) => sum + (a.entryFeeUsd || 0),
    0
  );
  
  // Use custom selected fee if user picked any, or an estimated sightseeing budget
  const actualSightseeingTotalUsd =
    selectedAttractions.length > 0
      ? customSightseeingFeeUsd
      : Math.round(selectedDays * (travelStyle === 'shoestring' ? 6 : travelStyle === 'smartBudget' ? 14 : 26));

  // Compute total trip items
  const accommodationTotalUsd = currentTier.accommodationPerNightUsd * selectedDays;
  const foodTotalUsd = currentTier.foodPerDayUsd * selectedDays;
  const transportTotalUsd = currentTier.transportPerDayUsd * selectedDays;
  const miscTotalUsd = currentTier.miscPerDayUsd * selectedDays;

  const totalTripCostUsd =
    accommodationTotalUsd +
    foodTotalUsd +
    transportTotalUsd +
    miscTotalUsd +
    actualSightseeingTotalUsd;

  const dailyAverageCostUsd = totalTripCostUsd / selectedDays;

  // Percentage calculations for visual bar
  const pctAccom = Math.round((accommodationTotalUsd / totalTripCostUsd) * 100);
  const pctFood = Math.round((foodTotalUsd / totalTripCostUsd) * 100);
  const pctSightseeing = Math.round((actualSightseeingTotalUsd / totalTripCostUsd) * 100);
  const pctTransport = Math.round((transportTotalUsd / totalTripCostUsd) * 100);
  const pctMisc = 100 - (pctAccom + pctFood + pctSightseeing + pctTransport);

  return (
    <section id="budget-estimator-section" className="py-14 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-16">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
            <span>Accurate Trip Budgeting & Price Estimations</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-stone-900 font-display">
            Budget Friendly Trip Cost Breakdown
          </h2>
          <p className="text-sm md:text-base text-stone-600 mt-1 max-w-2xl">
            Realist price estimation for a {selectedDays}-day trip to {guide.city}. Adjust your duration and travel style to see immediate cost projections.
          </p>
        </div>

        {/* Grand Total Highlight Badge */}
        <div className="bg-stone-900 text-white rounded-xl p-5 shadow-lg border border-stone-800 min-w-[280px]">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
              Total Trip Estimate ({selectedDays} {selectedDays === 1 ? 'Day' : 'Days'})
            </span>
            <span className="text-[11px] font-mono text-amber-400 bg-stone-800 px-2 py-0.5 rounded">
              ~{formatPriceInCurrency(dailyAverageCostUsd, currency)}/day
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight tabular-nums">
            {formatPriceInCurrency(totalTripCostUsd, currency)}
          </div>
          <div className="text-[11px] text-stone-300 mt-1">
            Includes stay, street food, attractions & transport
          </div>
        </div>
      </div>

      {/* Control Panel: Style & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-stone-100/80 p-4 rounded-xl border border-stone-200">
        {/* Style Selector */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Select Your Travel Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'shoestring' as const, label: 'Shoestring', sub: 'Hostel & street bites' },
              { id: 'smartBudget' as const, label: 'Smart Budget', sub: 'Private room & bistros' },
              { id: 'comfortable' as const, label: 'Comfortable', sub: 'Boutique & taxi hops' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onTravelStyleChange(st.id)}
                className={`p-2.5 rounded-lg text-left transition-all border cursor-pointer ${
                  travelStyle === st.id
                    ? 'bg-white border-stone-900 shadow-xs'
                    : 'bg-stone-50/60 border-stone-200 text-stone-600 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold text-stone-900">{st.label}</div>
                <div className="text-[10px] text-stone-500 truncate">{st.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Slider / Picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Trip Length: <span className="text-stone-900">{selectedDays} Days</span>
            </label>
            <span className="text-xs text-stone-500 font-mono">1 – 14 Days</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="14"
              value={selectedDays}
              onChange={(e) => onDaysChange(Number(e.target.value))}
              className="w-full accent-stone-900 cursor-pointer h-2 bg-stone-200 rounded-lg"
            />
            <div className="flex items-center gap-1">
              {[1, 3, 5, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => onDaysChange(d)}
                  className={`px-2 py-1 text-xs rounded border cursor-pointer ${
                    selectedDays === d
                      ? 'bg-stone-900 text-white font-bold border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Spending Distribution Bar */}
      <div className="mb-8 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            Budget Distribution Breakdown
          </span>
          <span className="font-mono text-stone-500">100% Total Cost</span>
        </div>

        {/* Progress Multi-Bar */}
        <div className="w-full h-3.5 bg-stone-100 rounded-full overflow-hidden flex gap-0.5">
          <div
            style={{ width: `${pctAccom}%` }}
            className="bg-stone-800 transition-all"
            title={`Accommodation: ${pctAccom}%`}
          />
          <div
            style={{ width: `${pctFood}%` }}
            className="bg-amber-500 transition-all"
            title={`Street Food & Dining: ${pctFood}%`}
          />
          <div
            style={{ width: `${pctSightseeing}%` }}
            className="bg-emerald-600 transition-all"
            title={`Attractions & Fees: ${pctSightseeing}%`}
          />
          <div
            style={{ width: `${pctTransport}%` }}
            className="bg-blue-600 transition-all"
            title={`Local Transit: ${pctTransport}%`}
          />
          <div
            style={{ width: `${pctMisc}%` }}
            className="bg-stone-400 transition-all"
            title={`Buffer / Misc: ${pctMisc}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs mt-3 pt-2 text-stone-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-800" />
            <span>Stay ({pctAccom}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Food ({pctFood}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Attractions ({pctSightseeing}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Transit ({pctTransport}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
            <span>Buffer ({pctMisc}%)</span>
          </div>
        </div>
      </div>

      {/* Detailed Cost Line-Item Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Accommodation */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 mb-3">
              <Bed className="w-4 h-4" />
            </div>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">
              Accommodation
            </div>
            <div className="text-lg font-bold text-stone-900 font-mono tabular-nums mb-1">
              {formatPriceInCurrency(accommodationTotalUsd, currency)}
            </div>
            <div className="text-xs text-stone-500 font-mono mb-2">
              {formatPriceInCurrency(currentTier.accommodationPerNightUsd, currency)} / night
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              {currentTier.accommodationDescription}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
            {selectedDays} Nights
          </div>
        </div>

        {/* 2. Street Food & Local Dining */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">
              Street Food & Meals
            </div>
            <div className="text-lg font-bold text-stone-900 font-mono tabular-nums mb-1">
              {formatPriceInCurrency(foodTotalUsd, currency)}
            </div>
            <div className="text-xs text-stone-500 font-mono mb-2">
              {formatPriceInCurrency(currentTier.foodPerDayUsd, currency)} / day
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Signature street stalls, night markets, and local casual eateries (3 meals + snacks).
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
            {selectedDays} Days of Eating
          </div>
        </div>

        {/* 3. Attractions Entry Fees */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <Ticket className="w-4 h-4" />
            </div>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">
              Attractions Entry Fees
            </div>
            <div className="text-lg font-bold text-stone-900 font-mono tabular-nums mb-1">
              {formatPriceInCurrency(actualSightseeingTotalUsd, currency)}
            </div>
            <div className="text-xs text-emerald-700 font-semibold mb-2">
              {selectedAttractions.length > 0
                ? `${selectedAttractions.length} Chosen Attractions`
                : 'Standard City Sightseeing'}
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              {selectedAttractions.length > 0
                ? 'Exact sum of admission tickets for your selected attractions.'
                : 'Average admission fees for top monuments & shrines with free spots mixed in.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
            Calculated Live
          </div>
        </div>

        {/* 4. Local Transit */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
              <Bus className="w-4 h-4" />
            </div>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">
              Local Transport
            </div>
            <div className="text-lg font-bold text-stone-900 font-mono tabular-nums mb-1">
              {formatPriceInCurrency(transportTotalUsd, currency)}
            </div>
            <div className="text-xs text-stone-500 font-mono mb-2">
              {formatPriceInCurrency(currentTier.transportPerDayUsd, currency)} / day
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Subway lines, city buses, river ferries, or affordable local rideshare hops.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
            Transit Passes Included
          </div>
        </div>

        {/* 5. Buffer & Safety Cushion */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">
              Buffer & Misc
            </div>
            <div className="text-lg font-bold text-stone-900 font-mono tabular-nums mb-1">
              {formatPriceInCurrency(miscTotalUsd, currency)}
            </div>
            <div className="text-xs text-stone-500 font-mono mb-2">
              {formatPriceInCurrency(currentTier.miscPerDayUsd, currency)} / day
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Local eSIM, water refills, incidental museum locker fees, and emergency cash.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
            Financial Safety Net
          </div>
        </div>
      </div>
    </section>
  );
};
