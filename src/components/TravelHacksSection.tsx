import React from 'react';
import { CityGuide } from '../types/travel';
import { Lightbulb, Compass, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TravelHacksSectionProps {
  guide: CityGuide;
}

export const TravelHacksSection: React.FC<TravelHacksSectionProps> = ({ guide }) => {
  return (
    <section id="travel-hacks-section" className="py-14 bg-stone-100/50 border-t border-stone-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Insider Knowledge</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 font-display">
            Local Money-Saving Hacks for {guide.city}
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Practical strategies from seasoned travelers and locals to shave 20–40% off your expenses in {guide.city}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Best Travel Season Box */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-2 font-display">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Optimal Budget Travel Season</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                {guide.bestBudgetSeason}
              </p>
            </div>
            <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
              Visiting during shoulder season cuts accommodation rates by up to 35% compared to peak holidays.
            </div>
          </div>

          {/* Local Transport Advice */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between md:col-span-2">
            <div>
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-2 font-display">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Local Transport & Pass Secrets</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {guide.localTransportAdvice}
              </p>
            </div>
            <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100 mt-3">
              Always check whether an unlimited day pass or rechargeable transit card is cheaper than single tickets.
            </div>
          </div>
        </div>

        {/* Bulleted Money Saving Hacks */}
        <div className="mt-6 bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Essential Budget Hacks</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guide.moneySavingHacks.map((hack, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-stone-50/70 rounded-lg border border-stone-100 text-xs text-stone-700 leading-relaxed"
              >
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span>{hack}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
