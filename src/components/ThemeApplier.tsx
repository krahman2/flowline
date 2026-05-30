import { useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { applyAccent } from '../store/accents';

export function ThemeApplier() {
  const { preferences } = useApp();
  useEffect(() => {
    applyAccent(preferences.accent);
  }, [preferences.accent]);
  return null;
}
