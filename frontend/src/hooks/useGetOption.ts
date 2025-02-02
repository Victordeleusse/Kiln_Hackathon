import { useQuery } from '@tanstack/react-query';

export function useGetOption(type: 'seller' | 'buyer', param: string) {
  const queryKey = ['options', type, param]; // Unique query key for caching

  const fetchOptions = async () => {
    const response = await fetch(`/api/options?${type}=${param}`);
    if (!response.ok) {
      throw new Error('Failed to fetch options');
    }
    const result = await response.json();
    return result.data;
  };

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: fetchOptions,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  return {
    data,
    isLoading,
  };
}
