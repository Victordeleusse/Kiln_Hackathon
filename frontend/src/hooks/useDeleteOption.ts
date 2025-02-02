import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { OPTION_MANAGER_ADDRESS, optionManagerABI } from '@/lib/web3';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

export function useBlockchainDeleteOption() {
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const blockhainDeleteOption = async (
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
    blockhainDeleteOption,
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

      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteOptionInDatabase, isLoading, error };
}
