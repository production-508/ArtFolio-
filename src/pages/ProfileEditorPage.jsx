import React from 'react';
import ProfileEditor from '../components/profile/ProfileEditor';
import { ProfileCustomizationProvider } from '../contexts/ProfileCustomizationContext';

export default function ProfileEditorPage() {
  return (
    <ProfileCustomizationProvider>
      <ProfileEditor />
    </ProfileCustomizationProvider>
  );
}
