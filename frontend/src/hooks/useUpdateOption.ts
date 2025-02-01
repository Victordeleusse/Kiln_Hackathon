import { useState } from 'react';
import { toast } from 'sonner';

export function useUpdateOption() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateOption = async (
    id: number,
    updates: { buyer_address?: string; asset_transfered?: boolean }
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/options/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update option');

      const result = await response.json();
      toast.success('Option updated successfully');

      return result.data;
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to update option');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateOption, isLoading, error };
}
