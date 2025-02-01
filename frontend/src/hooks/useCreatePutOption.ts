import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { optionManagerABI, erc20ABI, OPTION_MANAGER_ADDRESS, USDC_ADDRESS } from '../config/contract-config';
import { watchContractEvent } from '@wagmi/core'

export function useCreatePutOption() {
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { address } = useAccount();

  const createOption = async ({
    strikePrice,
    premiumPrice,
    expiry,
    asset,
    amount
  }: {
    strikePrice: string,
    premiumPrice: string,
    expiry: Date,
    asset: string,
    amount: string
  }) => {
    try {
      // First approve USDC spending
      await writeContract({
        address: USDC_ADDRESS,
        abi: erc20ABI,
        functionName: 'approve',
        args: [OPTION_MANAGER_ADDRESS, BigInt(strikePrice)]
      });

      // Then create the option
      await writeContract({
        address: OPTION_MANAGER_ADDRESS,
        abi: optionManagerABI,
        functionName: 'createOptionPut',
        args: [
          BigInt(strikePrice),
          BigInt(premiumPrice),
          BigInt(Math.floor(expiry.getTime() / 1000)),
          asset as `0x${string}`,
          BigInt(amount)
        ]
      });

      return true;
    } catch (err) {
      console.error('Error creating option:', err);
      return false;
    }
  };

  return {
    createOption,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error
  };
}

export function pushCreatedPutOptionInDatabase() {

  const { address } = useAccount();

  const pushPutOptionInDatabase = async ({
    id_blockchain,
    strikePrice,
    premiumPrice,
    expiry,
    asset,
    amount
  }: {
    id_blockchain: string,
    strikePrice: string,
    premiumPrice: string,
    expiry: Date,
    asset: string,
    amount: string
  }) => {
    try {
      await fetch('/api/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_blockchain: id_blockchain,
          strike_price: strikePrice,
          premium_price: premiumPrice,
          expiry: expiry.toISOString(),
          asset,
          amount,
          seller_address: address,
        })
      });

      return true;
    } catch (err) {
      console.error('Error creating option:', err);
      return false;
    }
  };
  return {
    pushPutOptionInDatabase,
  };
}