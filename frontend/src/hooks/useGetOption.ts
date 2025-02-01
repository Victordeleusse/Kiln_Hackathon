import { useState } from 'react';
import { toast } from 'sonner';

export function useGetOption() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getOptions = async (type: 'seller' | 'buyer', param: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/options?${type}=${param}`);
      if (!response.ok) {
        throw new Error('Failed to fetch options');
      }
      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to fetch options');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getOptions, isLoading, error };
}