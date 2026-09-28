import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8 pb-8 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-display font-bold">
              <Compass className="w-4 h-4 text-stone-950" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight font-display">
              RoamWise
            </span>
          </div>
          <p className="text-stone-400 max-w-sm text-xs leading-relaxed">
            The smart traveler's companion for verified attraction entry fees, authentic local street food stalls, and real budget-friendly trip cost projections.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div>
            <div className="text-white font-semibold mb-2.5 uppercase tracking-wider text-[11px]">
              Top Destinations
            </div>
            <ul className="space-y-1.5 text-stone-400">
              <li><a href="#hero" className="hover:text-white transition-colors">Kyoto, Japan</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">Rome, Italy</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">Bangkok, Thailand</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">Jaipur, India</a></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold mb-2.5 uppercase tracking-wider text-[11px]">
              Explorer Features
            </div>
            <ul className="space-y-1.5 text-stone-400">
              <li><a href="#attractions-section" className="hover:text-white transition-colors">Attraction Entry Fees</a></li>
              <li><a href="#food-stalls-section" className="hover:text-white transition-colors">Famous Street Food Stalls</a></li>
              <li><a href="#budget-estimator-section" className="hover:text-white transition-colors">Trip Price Calculator</a></li>
              <li><a href="#travel-hacks-section" className="hover:text-white transition-colors">Local Money Hacks</a></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold mb-2.5 uppercase tracking-wider text-[11px]">
              Traveler Transparency
            </div>
            <div className="flex items-start gap-1.5 text-[11px] text-stone-400 leading-normal">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Attraction fees and street food prices are grounded in official heritage registries and local market menus.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
        <div>
          © {new Date().getFullYear()} RoamWise. Built for budget explorers worldwide.
        </div>
        <div className="flex items-center gap-4">
          <span>Official Monument Rates</span>
          <span>·</span>
          <span>Street Food Price Index</span>
          <span>·</span>
          <span>Zero Commission</span>
        </div>
      </div>
    </footer>
  );
};
