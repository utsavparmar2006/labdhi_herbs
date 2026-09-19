import { Metadata } from 'next';
import TrackOrderClient from './TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Order | Labdhi Herbs',
  description: 'Track the live delivery progress of your authentic Ayurvedic herbal order and view your official invoice.',
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
