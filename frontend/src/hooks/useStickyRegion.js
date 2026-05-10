import { useState, useEffect } from 'react';

export function useStickyRegion() {
  const [region, setRegion] = useState('GB');

  const updateRegion = (newRegion) => {
    setRegion(newRegion);
    localStorage.setItem('hantavirus-tracker-region', newRegion);
  };

  return [region, updateRegion];
}
