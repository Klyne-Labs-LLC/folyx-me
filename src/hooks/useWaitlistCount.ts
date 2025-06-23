import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook to fetch and manage waitlist count
 * @returns {object} Object containing count, loading state, and error
 */
export const useWaitlistCount = () => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetches the total count of waitlist signups
     */
    const fetchWaitlistCount = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get count of all waitlist entries
        const { count, error } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error('Error fetching waitlist count:', error);
          setError('Failed to load waitlist count');
          return;
        }

        // Set the count (default to 0 if null)
        setCount(count || 0);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Failed to load waitlist count');
      } finally {
        setLoading(false);
      }
    };

    fetchWaitlistCount();
  }, []);

  return { count, loading, error };
}; 