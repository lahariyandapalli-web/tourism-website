import React from 'react';
import { CityGuide, SupportedCurrency } from '../types/travel';
import { formatPriceInCurrency } from '../utils/currency';
import { Coins, Sparkles, MapPin, Calendar, Check, ArrowRight } from 'lucide-react';

interface CityOverviewBannerProps {
  guide: CityGuide;
  currency: SupportedCurrency;
}

export const CityOverviewBanner: React.FC<CityOverviewBannerProps> = ({ guide, currency }) => {
  const isIndia = guide.country.toLowerCase() === 'india';
  const isVizag = guide.city.toLowerCase().includes('visakhapatnam') || guide.city.toLowerCase().includes('vizag');
  const isKyoto = guide.city.toLowerCase().includes('kyoto');
  const isRome = guide.city.toLowerCase().includes('rome');

  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: City Title, Country Tag & Summary */}
          <div className="flex items-start gap-5 max-w-3xl">
            {/* Optional Scenic Thumbnail */}
            {(isVizag || isKyoto || isRome) && (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden shrink-0 shadow-md border border-stone-200 hidden sm:block">
                <img
                  src={
                    isVizag
                      ? '/src/assets/images/vizag_beach_coastline_1790579528184.jpg'
                      : isKyoto
                      ? '/src/assets/images/attraction_kyoto_shrine_1790578232704.jpg'
                      : '/src/assets/images/attraction_rome_colosseum_1790578260195.jpg'
                  }
                  alt={`${guide.city} scenic landmark`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-500 mb-1.5">
                <span className="flex items-center gap-1.5 text-stone-800 font-bold bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  <span>{isIndia ? '🇮🇳' : '🌍'}</span>
                  <span>{guide.country}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-stone-700">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {guide.city}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700">{guide.tagline}</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-stone-900 font-display tracking-tight leading-tight mb-2">
                Budget Travel Guide: {guide.city}
              </h2>

              <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
                {guide.summary}
              </p>
            </div>
          </div>

          {/* Right: Key Economic Metrics / Currency Snapshot */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Local Currency Snapshot */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs min-w-[170px]">
              <div className="flex items-center gap-1.5 text-stone-500 font-medium mb-1">
                <Coins className="w-3.5 h-3.5 text-stone-400" />
                <span>Local Currency</span>
              </div>
              <div className="text-sm font-bold text-stone-900 font-mono">
                {guide.localCurrency.code} ({guide.localCurrency.symbol})
              </div>
              <div className="text-[11px] text-stone-500 font-mono">
                1 USD ≈ {guide.localCurrency.symbol}{guide.localCurrency.exchangeRateToUsd.toLocaleString()}
              </div>
            </div>

            {/* Daily Shoestring Cost */}
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs min-w-[170px]">
              <div className="flex items-center gap-1.5 text-amber-900 font-medium mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Budget Daily From</span>
              </div>
              <div className="text-sm font-bold text-amber-900 font-mono tabular-nums">
                {formatPriceInCurrency(guide.dailyBudgetSummary.shoestringDailyUsd, currency)}
                <span className="text-xs font-normal text-amber-800"> / day</span>
              </div>
              <div className="text-[11px] text-amber-800">
                Shoestring stay + street food
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

