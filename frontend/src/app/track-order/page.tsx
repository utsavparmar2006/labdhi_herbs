import { Metadata } from 'next';
import { Suspense } from 'react';
import TrackOrderClient from './TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Order | Labdhi Herbs',
  description: 'Track the live delivery progress of your authentic Ayurvedic herbal order and view your official invoice.',
};

export const dynamic = 'force-dynamic';

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#1F3A2E]/20 border-t-[#1F3A2E] rounded-full animate-spin" />
            <p className="text-xs font-semibold text-[#1F3A2E]">Loading Order Tracker...</p>
          </div>
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  );
}
