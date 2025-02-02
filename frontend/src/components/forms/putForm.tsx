"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchContractEvent } from "wagmi";
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useBlockchainCreatePutOption, useDatabaseCreatePutOption } from '@/hooks/useCreatePutOption';
import { useUpdateOption } from "@/hooks/useUpdateOption";
import { useDeleteOption } from "@/hooks/useDeleteOption";
import { optionManagerABI, OPTION_MANAGER_ADDRESS } from "@/lib/web3";

export function PutForm({ address }: { address?: string }) {
  const [date, setDate] = useState<Date>();
  const [enableSpiko, setEnableSpiko] = useState(false);
  const [assetAddress, setAssetAddress] = useState(address || ""); // Manage assetAddress in state

  const { address: connectedAddress, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { createOption, isLoading } = useBlockchainCreatePutOption();
  const { pushPutOptionInDatabase } = useDatabaseCreatePutOption();
  const { updateOption } = useUpdateOption();
  const { deleteOptionInDatabase } = useDeleteOption();

  // Listen for OptionCreated event
  useWatchContractEvent({
    address: OPTION_MANAGER_ADDRESS,
    abi: optionManagerABI,
    eventName: "OptionCreated",
    onLogs(logs) {
      console.log('New logs CREATE!', logs[0].args.optionId);
      const log = logs[0];
      const optionId = log.args.optionId?.toString() || "0";
      const strikePrice = log.args.strikePrice?.toString() || "0";
      const premiumPrice = log.args.premium?.toString() || "0";
      const expiry = log.args.expiry ? new Date(Number(log.args.expiry) * 1000) : new Date();
      const asset = log.args.asset?.toString() || "";
      const amount = log.args.assetAmount?.toString() || "0";

      // Save the option to the database
      pushPutOptionInDatabase({
        id_blockchain: optionId,
        strikePrice,
        premiumPrice,
        expiry,
        asset,
        amount,
      });
    },
  });

  useWatchContractEvent({
    address: OPTION_MANAGER_ADDRESS,
    abi: optionManagerABI,
    eventName: "OptionBought",
    onLogs(logs) {
      console.log('New logs BUY!', logs[0].args.optionId);
      const optionId = logs[0].args.optionId ? logs[0].args.optionId.toString() : "0";
      const optionIdNumber = Number(optionId);
      const optionBuyer = logs[0].args.buyer ? logs[0].args.buyer.toString() : "";

      updateOption(optionIdNumber, { buyer_address: optionBuyer });
    }
  });

  useWatchContractEvent({
    address: OPTION_MANAGER_ADDRESS,
    abi: optionManagerABI,
    eventName: "OptionDeleted",
    onLogs(logs) {
      console.log('New logs DELETE!', logs[0].args.optionId);
      const optionId = logs[0].args.optionId ? logs[0].args.optionId.toString() : "0";
      const optionIdNumber = Number(optionId);

      deleteOptionInDatabase(optionIdNumber);
    }
  });

  useWatchContractEvent({
    address: OPTION_MANAGER_ADDRESS,
    abi: optionManagerABI,
    eventName: "AssetSentToTheContract",
    onLogs(logs) {
      console.log('New logs ASSET SEND TO!', logs[0].args.optionId);
      const optionId = logs[0].args.optionId ? logs[0].args.optionId.toString() : "0";
      const buyer = logs[0].args.buyer ? logs[0].args.buyer.toString() : "";
      const optionIdNumber = Number(optionId);

      updateOption(optionIdNumber, {
        asset_transfered: true,
      });
    }
  });

  useWatchContractEvent({
    address: OPTION_MANAGER_ADDRESS,
    abi: optionManagerABI,
    eventName: "AssetReclaimFromTheContract",
    onLogs(logs) {
      console.log('New logs ASSET RECLAIM TO!', logs[0].args.optionId);
      const optionId = logs[0].args.optionId ? logs[0].args.optionId.toString() : "0";
      const buyer = logs[0].args.buyer ? logs[0].args.buyer.toString() : "";
      const optionIdNumber = Number(optionId);

      updateOption(optionIdNumber, {
        asset_transfered: false,
      });
    }
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if the user is connected
    if (!isConnected || !connectedAddress) {
      openConnectModal?.();
      return;
    }

    // Check if the expiry date is selected
    if (!date) {
      alert("Please select an expiry date.");
      return;
    }

    const formData = new FormData(e.currentTarget);

    try {
      // Create the option on the blockchain
      await createOption({
        strikePrice: formData.get('strikePrice') as string,
        premiumPrice: formData.get('premiumPrice') as string,
        expiry: date,
        asset: assetAddress, // Use the state value for assetAddress
        amount: formData.get('amount') as string,
      });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Put Option</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Label className="text-lg block">
                  <span className='cursor-pointer'>Asset Address</span>
                  <Input
                    name="assetAddress"
                    className="text-base mt-2"
                    value={assetAddress}
                    disabled={!!address} // Disable if address is provided
                    onChange={(e) => setAssetAddress(e.target.value)} // Add onChange handler
                  />
                </Label>
                <Label className="text-lg block">
                  <span className='cursor-pointer'>Amount</span>
                  <Input type="number" name="amount" className="text-base mt-2" />
                </Label>
                <Label className="text-lg block">
                  <span className='cursor-pointer'>Strike Price</span>
                  <Input type="number" name="strikePrice" className="text-base mt-2" />
                </Label>
                <Label className="text-lg block">
                  <span className='cursor-pointer'>Premium Price</span>
                  <Input type="number" name="premiumPrice" className="text-base mt-2" />
                </Label>
                <Label className="text-lg block md:col-span-2">
                  <span className='cursor-pointer'>Expiry</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full text-lg mt-2 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick an expiration date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </Label>
              </div>
              <div className="w-full flex items-center space-x-2">
                <Checkbox id="spiko" className="rounded-[3px] h-5 w-5" onCheckedChange={() => setEnableSpiko(!enableSpiko)} />
                <Label htmlFor="spiko" className="md:text-lg cursor-pointer w-full">
                  Do you want to enable {" "}
                  <Link href="https://www.spiko.io/" target="_blank" rel="noopener noreferrer" className="underline">
                    Spiko
                  </Link>
                  {" "}fund solution?
                </Label>
              </div>
              <div className={cn("transition-all duration-300 overflow-hidden flex justify-evenly", enableSpiko ? "h-fit p-4 border rounded-sm" : "h-0")}>
                <Toggle className="w-fit h-fit py-2" asChild>
                  <div>
                    <Image src="https://cdn.prod.website-files.com/670cbf7bea9b168605318b30/670cbf7bea9b168605318bfb_Spiko%20Token.svg" width={300} height={300} alt="Spiko" className="w-24 h-24" />
                    <div>
                      <h2 className="font-bold text-3xl">2.8%</h2>
                      <p className="text-xs text-gray-300">net yield in EUR</p>
                    </div>
                  </div>
                </Toggle>
                <Toggle className="w-fit h-fit py-2" asChild>
                  <div>
                    <Image src="https://cdn.prod.website-files.com/670cbf7bea9b168605318b30/670cbf7bea9b168605318bfc_Spiko%20Token%202.svg" width={300} height={300} alt="Spiko" className="w-24 h-24" />
                    <div>
                      <h2 className="font-bold text-3xl">3.84%</h2>
                      <p className="text-xs text-gray-300">net yield in USD</p>
                    </div>
                  </div>
                </Toggle>
              </div>
              <Button type="submit" className="w-full text-base mt-4" disabled={!isConnected || isLoading}>
                {isLoading ? "Creating..." : "Create Put Option"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
