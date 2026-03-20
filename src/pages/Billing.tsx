import React, { useState } from 'react';
import { 
  CheckCircle2, 
  CreditCard, 
  Zap, 
  Shield, 
  Users, 
  MessageSquare, 
  Mail, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function Billing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [contacts, setContacts] = useState(1000);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  // Calculate price based on contacts (similar to Manychat's sliding scale)
  const calculateProPrice = (contacts: number) => {
    if (contacts <= 1000) return 15;
    if (contacts <= 5000) return 45;
    if (contacts <= 10000) return 65;
    if (contacts <= 25000) return 135;
    if (contacts <= 50000) return 255;
    return 495; // 100k+
  };

  const INR_RATE = 83;
  const baseMonthlyPrice = calculateProPrice(contacts);
  
  const proMonthlyPrice = currency === 'USD' ? baseMonthlyPrice : baseMonthlyPrice * INR_RATE;
  const proAnnualPrice = Math.floor(proMonthlyPrice * 0.8); // 20% discount
  
  const currencySymbol = currency === 'USD' ? '$' : '₹';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-on-surface-variant text-lg mb-8">
          Grow your audience and automate your marketing. Upgrade as you scale.
        </p>
        
        {/* Currency Toggle */}
        <div className="flex justify-center items-center gap-2 bg-surface-container-low p-1 rounded-xl inline-flex">
          <button
            onClick={() => setCurrency('USD')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              currency === 'USD' ? "bg-white shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency('INR')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              currency === 'INR' ? "bg-white shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            INR (₹)
          </button>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center items-center gap-4 mb-12">
        <span className={cn("text-sm font-bold", !isAnnual ? "text-on-surface" : "text-on-surface-variant")}>
          Monthly
        </span>
        <button 
          onClick={() => setIsAnnual(!isAnnual)}
          className="w-14 h-7 bg-surface-container-high rounded-full p-1 relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-pressed={isAnnual}
        >
          <div className={cn(
            "w-5 h-5 bg-primary rounded-full shadow-md transition-transform duration-300",
            isAnnual ? "translate-x-7" : "translate-x-0"
          )} />
        </button>
        <span className={cn("text-sm font-bold flex items-center gap-2", isAnnual ? "text-on-surface" : "text-on-surface-variant")}>
          Annually
          <span className="bg-emerald-500/10 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            Save 20%
          </span>
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* Free Plan */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 shadow-lg relative overflow-hidden flex flex-col">
          <div className="mb-8">
            <h3 className="text-2xl font-bold font-headline text-on-surface mb-2">Free</h3>
            <p className="text-on-surface-variant text-sm h-10">
              Perfect for getting started with basic automation.
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold font-headline text-on-surface">{currencySymbol}0</span>
              <span className="text-on-surface-variant font-medium">/mo</span>
            </div>
            <p className="text-sm text-on-surface-variant mt-2">Up to 1,000 contacts</p>
          </div>

          <button className="w-full py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded-xl transition-colors mb-8">
            Current Plan
          </button>

          <div className="space-y-4 flex-1">
            <p className="text-sm font-bold text-on-surface uppercase tracking-wider">Includes:</p>
            <ul className="space-y-3">
              {[
                'Instagram, Facebook & WhatsApp',
                'Basic custom flows (up to 3)',
                'Up to 1,000 contacts',
                'Standard analytics',
                'Community support'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm text-on-surface-variant">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 border-2 border-primary shadow-xl shadow-primary/10 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            Most Popular
          </div>
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold font-headline text-on-surface mb-2">Pro</h3>
            <p className="text-on-surface-variant text-sm h-10">
              Advanced features for growing businesses.
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold font-headline text-on-surface">
                {currencySymbol}{(isAnnual ? proAnnualPrice : proMonthlyPrice).toLocaleString()}
              </span>
              <span className="text-on-surface-variant font-medium">/mo</span>
            </div>
            
            {/* Contact Slider */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm font-bold text-on-surface">
                <span>Contacts</span>
                <span className="text-primary">{contacts.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="100000" 
                step="1000"
                value={contacts}
                onChange={(e) => setContacts(parseInt(e.target.value))}
                className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <button className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20 mb-8 flex items-center justify-center gap-2">
            Upgrade to Pro
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-4 flex-1">
            <p className="text-sm font-bold text-on-surface uppercase tracking-wider">Everything in Free, plus:</p>
            <ul className="space-y-3">
              {[
                'Unlimited custom flows',
                'Remove Avaloflow branding',
                'SMS & Email marketing',
                'Advanced integrations (Shopify, Zapier)',
                'A/B testing & advanced analytics',
                'Priority email support'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm text-on-surface-variant">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Feature Comparison or FAQ could go here */}
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <h3 className="text-2xl font-bold font-headline text-on-surface mb-4">Need a custom solution?</h3>
        <p className="text-on-surface-variant mb-6">
          For agencies and large enterprises with over 100,000 contacts, we offer custom pricing, dedicated account managers, and white-labeling options.
        </p>
        <button className="px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded-xl transition-colors">
          Contact Sales
        </button>
      </div>

    </div>
  );
}
