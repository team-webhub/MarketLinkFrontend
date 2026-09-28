// src/hooks/useMarkets.js
import { useState, useEffect } from 'react';
import { fetchMarketsAPI } from '../Services/marketService';

export const useMarkets = (selectedLocation, selectedDay) => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const result = await fetchMarketsAPI(selectedLocation, selectedDay);
        if (isMounted) {
          if (result.success) {
            setMarkets(result.data);
            setError(null);
          } else {
            setMarkets([]);
            setError(result.error);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setMarkets([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedLocation, selectedDay]);

  return { markets, loading, error };
};