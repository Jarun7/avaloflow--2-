import React from 'react';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  Mail, 
  Phone, 
  ChevronRight, 
  ExternalLink, 
  BookOpen, 
  PlayCircle, 
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const faqs = [
  { question: 'How do I connect my Instagram account?', answer: 'Go to Settings > Connected Accounts and click the "Connect" button next to Instagram. Follow the OAuth flow to authorize Avaloflow.' },
  { question: 'Can I schedule posts for multiple time zones?', answer: 'Yes, when creating a broadcast or automation, you can specify the target time zone or use the "Local Time" feature to deliver at the same time in each recipient\'s zone.' },
  { question: 'What are "Global Keywords"?', answer: 'Global Keywords are triggers that can start automations from anywhere in your connected ecosystem, such as a specific word in a DM or a comment.' },
  { question: 'How does the AI segmentation work?', answer: 'Our AI model analyzes user behavior, engagement patterns, and purchase history to automatically group your audience into high-value segments.' },
];

export function Support() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      {/* Hero Section */}
      <div className="bg-on-primary-fixed-variant p-12 md:p-20 rounded-3xl relative overflow-hidden shadow-2xl shadow-primary/20 text-center">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-white font-headline text-4xl md:text-5xl font-extrabold tracking-tight">How can we help?</h1>
          <p className="text-white/80 mt-6 text-lg leading-relaxed">
            Search our knowledge base or reach out to our support team for personalized assistance.
          </p>
          <div className="relative mt-10 max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search for articles, guides, and FAQs..." 
              className="w-full bg-white/10 text-white border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-base focus:ring-2 focus:ring-white/30 transition-all backdrop-blur-md placeholder:text-white/40"
            />
          </div>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute right-[-10%] top-[-20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
        <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px]"></div>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: MessageSquare, title: 'Live Chat', desc: 'Average response time: 2 mins', action: 'Start Chat', color: 'text-primary' },
          { icon: Mail, title: 'Email Support', desc: 'Average response time: 4 hours', action: 'Send Email', color: 'text-tertiary' },
          { icon: Phone, title: 'Phone Support', desc: 'Available for Enterprise plans', action: 'Call Us', color: 'text-on-surface-variant' },
        ].map((channel, idx) => (
          <div key={idx} className="bg-surface-container-lowest p-8 rounded-2xl no-line-card border border-outline-variant/10 flex flex-col items-center text-center group hover:border-primary/30 transition-all">
            <div className={cn("p-4 bg-surface-container-low rounded-2xl mb-6 group-hover:scale-110 transition-transform", channel.color)}>
              <channel.icon className="w-8 h-8" />
            </div>
            <h3 className="font-headline text-xl font-bold text-on-surface">{channel.title}</h3>
            <p className="text-on-surface-variant text-sm mt-2 mb-6">{channel.desc}</p>
            <button className="w-full py-3 bg-surface-container-low text-on-surface font-bold rounded-xl hover:bg-primary hover:text-white transition-all">
              {channel.action}
            </button>
          </div>
        ))}
      </div>

      {/* Knowledge Base Sections */}
      <div className="space-y-8">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Knowledge Base</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: BookOpen, title: 'Getting Started', count: '12 articles', color: 'bg-primary' },
            { icon: PlayCircle, title: 'Video Tutorials', count: '8 videos', color: 'bg-tertiary' },
            { icon: MessageCircle, title: 'Community Forum', count: '2.4k members', color: 'bg-on-surface-variant' },
            { icon: HelpCircle, title: 'Troubleshooting', count: '15 articles', color: 'bg-error' },
          ].map((section, idx) => (
            <div key={idx} className="bg-surface-container-lowest p-6 rounded-2xl no-line-card border border-outline-variant/10 flex items-center justify-between group hover:bg-surface-container-low transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg", section.color)}>
                  <section.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{section.title}</h3>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mt-1">{section.count}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-surface-container-low p-8 md:p-12 rounded-3xl border border-outline-variant/10">
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/5">
              <h4 className="font-bold text-on-surface text-lg mb-2">{faq.question}</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <button className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group">
            View All FAQs <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center py-12">
        <h3 className="font-headline text-2xl font-bold text-on-surface">Still have questions?</h3>
        <p className="text-on-surface-variant mt-2 mb-8">Our team is available 24/7 to help you with any issues.</p>
        <div className="flex items-center justify-center gap-4">
          <button className="px-8 py-3 bg-on-primary-fixed-variant text-white rounded-xl font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95">
            Contact Support
          </button>
          <button className="px-8 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-container-highest transition-all flex items-center gap-2">
            Documentation <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
