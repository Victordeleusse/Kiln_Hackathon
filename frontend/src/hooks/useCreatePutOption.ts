import { useState } from 'react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

export function useCreatePutOption() {
    const { address } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createOption = async ({
        strikePrice,
        premiumPrice,
        expiry,
        asset
    }: {
        strikePrice: string,
        premiumPrice: string,
        expiry: Date,
        asset: string
    }) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              strike_price: strikePrice,
              premium_price: premiumPrice,
              expiry: expiry.toISOString(),
              asset,
              seller_address: address,
          })
        });

      if (!response.ok) {
        throw new Error("Failed to create option");
      }
      
        const result = await response.json();
        toast.success('Option created successfully');
        return result;
    } catch (err) {
        setError(err as Error);
        toast.error('Failed to create option');
        return null;
    } finally {
        setIsLoading(false);
    }
  };

  return { createOption, isLoading, error };
}
