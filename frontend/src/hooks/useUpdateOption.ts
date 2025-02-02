import { useState } from 'react';
import { toast } from 'sonner';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { optionManagerABI, erc20ABI, OPTION_MANAGER_ADDRESS, USDC_ADDRESS } from '../config/contract-config';

// Hook for buying an option
export function useBlockchainBuyOption() {
    const { writeContract, data: hash, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    const { address } = useAccount();

    const buyOption = async ({
        optionId,
        premium
    }: {
        optionId: string,
        premium: string
    }) => {
        try {
            // First approve USDC spending for premium
            await writeContract({
                address: USDC_ADDRESS,
                abi: erc20ABI,
                functionName: 'approve',
                args: [OPTION_MANAGER_ADDRESS, BigInt(premium)]
            });

            // Then buy the option
            await writeContract({
                address: OPTION_MANAGER_ADDRESS,
                abi: optionManagerABI,
                functionName: 'buyOption',
                args: [BigInt(optionId)]
            });

            return true;
        } catch (err) {
            console.error('Error buying option:', err);
            return false;
        }
    };

    return {
        buyOption,
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error
    };
}

type Address = `0x${string}`;

// Hook for sending asset to contract
export function useBlockchainSendAssetToContract() {
    const { writeContract, data: hash, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    const { address } = useAccount();

    const sendAssetToContract = async ({
        optionId,
        asset,
        amount,
        isETH = false
    }: {
        optionId: string,
        asset: string | Address,
        amount: string,
        isETH?: boolean
    }) => {
        try {
            if (!isETH) {
                // First approve ERC20 token spending
                const assetAddress = asset as Address;
                console.log('Approving spending of', amount, 'of', assetAddress);
                console.log(isETH);
                await writeContract({
                    address: assetAddress as `0x${string}`,
                    abi: erc20ABI,
                    functionName: 'approve',
                    args: [
                      OPTION_MANAGER_ADDRESS, 
                      BigInt(amount)
                    ]
                });
            }

            // Then send asset to contract
            await writeContract({
                address: OPTION_MANAGER_ADDRESS,
                abi: optionManagerABI,
                functionName: 'sendERC20AssetToContract',
                args: [
                  BigInt(optionId)
                ],
            });

            return true;
        } catch (err) {
            console.error('Error sending asset to contract:', err);
            return false;
        }
    };

    return {
        sendAssetToContract,
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error
    };
}

// Hook for reclaiming asset from contract
export function useBlockchainReclaimAssetFromContract() {
    const { writeContract, data: hash, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    const { address } = useAccount();

    const reclaimAssetFromContract = async ({
        optionId
    }: {
        optionId: string
    }) => {
        try {
            await writeContract({
                address: OPTION_MANAGER_ADDRESS,
                abi: optionManagerABI,
                functionName: 'reclaimAssetFromContract',
                args: [BigInt(optionId)]
            });

            return true;
        } catch (err) {
            console.error('Error reclaiming asset from contract:', err);
            return false;
        }
    };

    return {
        reclaimAssetFromContract,
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