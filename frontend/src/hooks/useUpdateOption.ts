import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { optionManagerABI, erc20ABI, OPTION_MANAGER_ADDRESS, USDC_ADDRESS } from '../config/contract-config';
import { watchContractEvent } from '@wagmi/core'
import { useState } from 'react';
import { toast } from 'sonner';

export function blockchainBuyOption() {
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { address } = useAccount();

  const blockchain_buyOption = async (
    id_blockchain: string,
  ) => {
      try {

          // Buy the option
          await writeContract({
              address: OPTION_MANAGER_ADDRESS,
              abi: optionManagerABI,
              functionName: 'buyOption',
              args: [BigInt(id_blockchain)]
          });

          return true;
      } catch (err) {
          console.error('Error buying option:', err);
          return false;
      }
  };

  return {
      blockchain_buyOption,
      isLoading: isConfirming,
      isSuccess: isConfirmed,
      error
  };
}

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