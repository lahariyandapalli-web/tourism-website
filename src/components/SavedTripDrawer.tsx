import React, { useState } from 'react';
import { Attraction, FoodStall, SupportedCurrency } from '../types/travel';
import { formatPriceInCurrency } from '../utils/currency';
import {
  X,
  Ticket,
  Utensils,
  Trash2,
  Copy,
  Check,
  Share2,
  Calendar,
} from 'lucide-react';

interface SavedTripDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  selectedAttractions: Attraction[];
  onRemoveAttraction: (id: string) => void;
  savedFoodStalls: FoodStall[];
  onRemoveFoodStall: (id: string) => void;
  currency: SupportedCurrency;
  totalTripEstimatedCostUsd: number;
  days: number;
}

export const SavedTripDrawer: React.FC<SavedTripDrawerProps> = ({
  isOpen,
  onClose,
  cityName,
  selectedAttractions,
  onRemoveAttraction,
  savedFoodStalls,
  onRemoveFoodStall,
  currency,
  totalTripEstimatedCostUsd,
  days,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalEntryFeesUsd = selectedAttractions.reduce(
    (acc, item) => acc + (item.entryFeeUsd || 0),
    0
  );

  const handleCopySummary = () => {
    const lines = [
      `🎒 My RoamWise Budget Trip Summary: ${cityName} (${days} Days)`,
      `Estimated Total Budget: ${formatPriceInCurrency(totalTripEstimatedCostUsd, currency)}`,
      '',
      `🏛️ Selected Attractions & Entry Fees (Total: ${formatPriceInCurrency(totalEntryFeesUsd, currency)}):`,
      ...selectedAttractions.map(
        (a) => `• ${a.name} — ${a.isFree ? 'FREE' : a.entryFeeFormatted}`
      ),
      '',
      `🍜 Saved Food Stalls & Street Bites:`,
      ...savedFoodStalls.map(
        (f) =>
          `• ${f.name} (${f.location}) — Avg meal: ${f.averageMealCostFormatted}`
      ),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 border-l border-stone-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Trip Itinerary & Budget
            </div>
            <h2 className="text-xl font-bold text-stone-900 font-display">
              {cityName} Pocket Planner
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Cost Tally Summary */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-semibold">
              Total Entry Fees
            </span>
            <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">
              {formatPriceInCurrency(totalEntryFeesUsd, currency)}
            </span>
            <span className="text-[10px] text-stone-400 block">
              {selectedAttractions.length} attraction{selectedAttractions.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="text-right border-l border-stone-800 pl-4">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-semibold">
              {days}-Day Est. Trip
            </span>
            <span className="text-lg font-bold text-white font-mono tabular-nums">
              {formatPriceInCurrency(totalTripEstimatedCostUsd, currency)}
            </span>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Selected Attractions Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-stone-500" />
                Chosen Attractions ({selectedAttractions.length})
              </span>
            </div>

            {selectedAttractions.length === 0 ? (
              <div className="text-xs text-stone-500 bg-stone-50 border border-stone-200 border-dashed rounded-lg p-4 text-center">
                No attractions added yet. Click "Add to My Trip Budget" on any attraction card to tally admission fees.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedAttractions.map((attraction) => (
                  <div
                    key={attraction.id}
                    className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-stone-900 mb-0.5">
                        {attraction.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span
                          className={`font-semibold font-mono ${
                            attraction.isFree ? 'text-emerald-700' : 'text-stone-700'
                          }`}
                        >
                          {attraction.isFree
                            ? 'Free'
                            : attraction.entryFeeFormatted}
                        </span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-500">
                          {attraction.recommendedDuration}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveAttraction(attraction.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Remove from itinerary"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Food Stalls Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-stone-500" />
                Food Crawl Wishlist ({savedFoodStalls.length})
              </span>
            </div>

            {savedFoodStalls.length === 0 ? (
              <div className="text-xs text-stone-500 bg-stone-50 border border-stone-200 border-dashed rounded-lg p-4 text-center">
                No street food stalls saved yet. Tap "Add to My Food Crawl" to build your custom tasting trail.
              </div>
            ) : (
              <div className="space-y-2">
                {savedFoodStalls.map((stall) => (
                  <div
                    key={stall.id}
                    className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-stone-900 mb-0.5">
                        {stall.name}
                      </div>
                      <div className="text-[11px] text-stone-500 mb-1">
                        {stall.location}
                      </div>
                      <div className="text-[11px] text-amber-800 font-medium">
                        Avg: {stall.averageMealCostFormatted}
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFoodStall(stall.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Remove from food crawl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50">
          <button
            onClick={handleCopySummary}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copy Trip & Budget Summary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
