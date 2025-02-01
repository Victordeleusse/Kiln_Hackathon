"use client";
import { useEffect, useState } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { optionManagerABI } from "@/lib/web3";
import { Address } from "viem";
import { OPTION_MANAGER_ADDRESS } from "@/lib/web3";

// Replace with your deployed contract address

type Option = {
  optionType: number;
  seller: Address;
  buyer: Address;
  strikePrice: number;
  premium: number;
  asset: Address;
  assetAmount: number;
  expiry: number;
  assetTransferedToTheContract: boolean;
};

export function useGetOptions() {
  const [options, setOptions] = useState<Option[]>([]);

  // Get total number of options
  const { data: optionCount } = useReadContract({
    address: OPTION_MANAGER_ADDRESS,
    abi: optionManagerABI,
    functionName: "optionCount",
  });

  const contractReadConfigs = Array.from({ length: Number(optionCount) }, (_, i) => ({
    address: OPTION_MANAGER_ADDRESS,
    abi: optionManagerABI,
    functionName: "options",
    args: [i],
  }));

  const { data: optionsData } = useReadContracts({
    contracts: contractReadConfigs,
  });

  useEffect(() => {
    if (optionsData) {
      const fetchedOptions: Option[] = optionsData.map((data: any) => ({
        optionType: Number(data.result[0]),
        seller: data.result[1] as Address,
        buyer: data.result[2] as Address,
        strikePrice: Number(data.result[3]),
        premium: Number(data.result[4]),
        asset: data.result[5] as Address,
        assetAmount: Number(data.result[6]),
        expiry: Number(data.result[7]),
        assetTransferedToTheContract: data.result[8] as boolean,
      }));
      setOptions(fetchedOptions);
    }
  }, [optionsData]);

  return { options };
}
