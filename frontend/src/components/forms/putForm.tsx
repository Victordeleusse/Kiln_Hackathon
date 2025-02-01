"use client"
import { useState, useEffect } from "react";
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

import { useCreatePutOption } from '../../hooks/useCreatePutOption';
import { useGetOption } from '../../hooks/useGetOption';
import { useUpdateOption } from '../../hooks/useUpdateOption';
import { useDeleteOption } from '../../hooks/useDeleteOption';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

export function PutForm() {
  const [date, setDate] = useState<Date>();
  const [enableSpiko, setEnableSpiko] = useState(false);
  const [spikoType, setSpikoType] = useState<"eur" | "usd">("eur");

  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  
  const [updatedAdress, setUpdatedAdress] = useState<string>('');
  const [debugId, setDebugId] = useState<string>('');
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isDebugLoading, setIsDebugLoading] = useState(false);
  
  const { createOption } = useCreatePutOption();
  const { getOptions } = useGetOption();
  const { updateOption } = useUpdateOption();
  const { deleteOption } = useDeleteOption();
  
  const handleGetOptions = async (type: 'seller' | 'buyer') => {
    setIsDebugLoading(true);
    try {
      const options = await getOptions(type, updatedAdress);
      setDebugResult(options);
      toast.success(`Options ${type} récupérées avec succès`);
    } catch (err) {
      console.error(err);
      toast.error(`Erreur lors de la récupération des options ${type}`);
    } finally {
      setIsDebugLoading(false);
    }
  };

  const handleUpdateBuyer = async () => {
    setIsDebugLoading(true);
    try {
      const updated = await updateOption(Number(debugId), {
        buyer_address: updatedAdress
      });
      setDebugResult(updated);
      toast.success('Adresse du buyer mise à jour avec succès');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour du buyer');
    } finally {
      setIsDebugLoading(false);
    }
  };
  
  const handleUpdateAssetTransfered = async (value: boolean) => {
    setIsDebugLoading(true);
    try {
        const updated = await updateOption(Number(debugId), {
          asset_transfered: value
        });
        setDebugResult(updated);
        toast.success('Asset marqué comme transféré avec succès');
      } catch (err) {
        console.error(err);
        toast.error('Erreur lors de la mise à jour du transfert');
      } finally {
        setIsDebugLoading(false);
      }
  };
  
  const handleDeleteOption = async () => {
    setIsDebugLoading(true);
    try {
      await deleteOption(Number(debugId));
      setDebugResult({ message: 'Option supprimée avec succès' });
      toast.success('Option supprimée avec succès');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDebugLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }

    if (!date) {
      toast.error('Please select an expiry date');
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await createOption({
        strikePrice: formData.get('strikePrice') as string,
        premiumPrice: formData.get('premiumPrice') as string,
        expiry: date,
        asset: formData.get('assetAddress') as string,
        amount: formData.get('amount') as string
      });

      console.log("Response:", response);
      if (response) {
        toast.success('Option created successfully!');
      } else {
        toast.error('Failed to create option');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred while creating the option');
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
                  />
                </Label>
                <Label className="text-lg block">
                  <span className='cursor-pointer'>Amount</span>
                  <Input
                    type="number"
                    name="amount"
                    className="text-base mt-2"
                  />
                </Label>
                <Label className="text-lg block">
                  <span className='cursor-pointer'>Strike Price</span>
                  <Input
                    type="number"
                    name="strikePrice"
                    className="text-base mt-2"
                  />
                </Label>
                <Label className="text-lg block">
                  <span className='cursor-pointer'>Premium Price</span>
                  <Input
                    type="number"
                    name="premiumPrice"
                    className="text-base mt-2"
                  />
                </Label>
                <Label className="text-lg block md:col-span-2">
                  <span className='cursor-pointer'>Expiry</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full text-lg mt-2 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick an expiration date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Label>

              </div>
              <div className="w-full flex items-center space-x-2">
                <Checkbox id="spiko" className="rounded-[3px] h-5 w-5 "
                  onCheckedChange={() => setEnableSpiko(!enableSpiko)} />
                <Label htmlFor="spiko" className="md:text-lg cursor-pointer w-full">
                  Do you want to enable{" "}
                  <Link
                    href="https://www.spiko.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Spiko
                  </Link>
                  {" "}staking solution ?
                </Label>
              </div>
              <div
                className={cn("transition-all duration-300 overflow-hidden flex justify-evenly ",
                  enableSpiko ? "h-fit p-4 border rounded-sm" : "h-0"
                )}
              >
                <Toggle className="w-fit h-fit py-2" asChild>
                  <div>
                    <Image
                      src="https://cdn.prod.website-files.com/670cbf7bea9b168605318b30/670cbf7bea9b168605318bfb_Spiko%20Token.svg"
                      width={300} height={300} alt="Spiko"
                      className="w-24 h-24"
                    />
                    <div>
                      <h2 className="font-bold text-3xl">2.8%</h2>
                      <p className="text-xs text-gray-300">net yield in EUR</p>
                    </div>
                  </div>

                </Toggle>
                <Toggle className="w-fit h-fit py-2" asChild>
                  <div>
                    <Image
                      src="https://cdn.prod.website-files.com/670cbf7bea9b168605318b30/670cbf7bea9b168605318bfc_Spiko%20Token%202.svg"
                      width={300} height={300} alt="Spiko"
                      className="w-24 h-24"
                    />
                    <div>
                      <h2 className="font-bold text-3xl">3.84%</h2>
                      <p className="text-xs text-gray-300">net yield in USD</p>
                    </div>
                  </div>
                </Toggle>
              </div>
              <Button type="submit" className="w-full text-base mt-4" disabled={!isConnected}>Submit</Button>
            </form>
          </CardContent>
        </Card>
      </div>


      {/* Section Debug */}
      <div className="mt-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Debug Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Address"
                  value={updatedAdress}
                  onChange={(e) => setUpdatedAdress(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Option ID"
                  value={debugId}
                  onChange={(e) => setDebugId(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Get Operations</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={() => handleGetOptions('seller')}
                    disabled={isDebugLoading || !updatedAdress}
                  >
                    Get Seller Options
                  </Button>
                  <Button 
                    onClick={() => handleGetOptions('buyer')}
                    disabled={isDebugLoading || !updatedAdress}
                  >
                    Get Buyer Options
                  </Button>
                </div>
              </div>

              {/* Update Operations */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Update Operations</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={handleUpdateBuyer}
                    disabled={isDebugLoading || !debugId || !updatedAdress}
                    variant="outline"
                  >
                    Update Buyer
                  </Button>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Transfer Asset</h3>
                    <div className="flex gap-2">
                      {/* Bouton pour mettre asset_transfered à true */}
                      <Button 
                        onClick={() => handleUpdateAssetTransfered(true)}
                        disabled={isDebugLoading || !debugId}
                        variant="outline"
                      >
                        Mark as Transferred
                      </Button>

                      {/* Bouton pour mettre asset_transfered à false */}
                      <Button 
                        onClick={() => handleUpdateAssetTransfered(false)}
                        disabled={isDebugLoading || !debugId}
                        variant="outline"
                      >
                        Undo Transfer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Operation */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Delete Operation</h3>
                <Button 
                  onClick={handleDeleteOption}
                  disabled={isDebugLoading || !debugId}
                  variant="destructive"
                >
                  Delete Option
                </Button>
              </div>
            </div>

            {/* Résultats */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-600 p-4 rounded-lg overflow-auto max-h-60">
                {debugResult ? JSON.stringify(debugResult, null, 2) : 'No result yet'}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
