import { useState } from 'react';
import { toast } from 'sonner';

export function useDeleteOption() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
  
    const deleteOption = async (id: number) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/options/${id}`, {
          method: 'DELETE'
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete option');
        }
  
        toast.success('Option deleted successfully');
        return true;
      } catch (err) {
        setError(err as Error);
        toast.error('Failed to delete option');
        return false;
      } finally {
        setIsLoading(false);
      }
    };
  
    return { deleteOption, isLoading, error };
  }