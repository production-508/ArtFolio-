import React from 'react';
import { ProfileCustomizationProvider } from '../contexts/ProfileCustomizationContext';
import ProfileEditor from '../components/profile/ProfileEditor';
import ImmersiveNav from '../components/ImmersiveNav';

export default function ProfileEditorPage() {
  return (
    <ProfileCustomizationProvider>
      <div className="min-h-screen bg-black">
        <ImmersiveNav />
        <ProfileEditor />
      </div>
    </ProfileCustomizationProvider>
  );
}
