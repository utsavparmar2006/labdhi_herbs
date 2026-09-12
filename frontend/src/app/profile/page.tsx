import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'My Profile | Labdhi Herbs',
  description: 'Manage your personal account details, shipping addresses, and security settings on Labdhi Herbs.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
