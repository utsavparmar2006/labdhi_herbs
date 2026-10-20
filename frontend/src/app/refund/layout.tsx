import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Labdhi Herbs',
  description:
    'Clear details regarding replacements, 48-hour return window, cancellations, and refunds for authentic Ayurvedic purchases.',
  alternates: {
    canonical: 'https://labdhiherbs.com/refund',
  },
};

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
