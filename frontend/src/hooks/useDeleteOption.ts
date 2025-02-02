import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { optionManagerABI, erc20ABI, OPTION_MANAGER_ADDRESS, USDC_ADDRESS } from '../config/contract-config';
import { watchContractEvent } from '@wagmi/core'
import { useState } from 'react';
import { toast } from 'sonner';
import internal from 'stream';

export function blockchainDeleteOption() {
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { address } = useAccount();

  const blockhain_deleteOption = async (
    id_blockchain: string,
  ) => {
    try {

      // Delete the option
       writeContract({
        address: OPTION_MANAGER_ADDRESS,
        abi: optionManagerABI,
        functionName: 'deleteOptionPut',
        args: [
          BigInt(id_blockchain),
        ]
      });

      return true;
    } catch (err) {
      console.error('Error creating option:', err);
      return false;
    }
  };

  return {
    blockhain_deleteOption,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error
  };
}


export function useDeleteOption() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
  
    const deleteOptionInDatabase = async (id: number) => {
      setIsLoading(true);
      try {
        console.log("ID TO DELETE BEFORE FETCH", id)
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
  
    return { deleteOptionInDatabase, isLoading, error };
  }
