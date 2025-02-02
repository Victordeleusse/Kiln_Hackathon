"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useGetOption } from "../../hooks/useGetOption";
import { useUpdateOption } from "../../hooks/useUpdateOption";
import { useDeleteOption, blockchainDeleteOption } from "../../hooks/useDeleteOption";
import { blockchainBuyOption } from "../../hooks/useUpdateOption";

export function CallHooks() {
  const [updatedAddress, setUpdatedAddress] = useState<string>("");
  const [debugId, setDebugId] = useState<string>("");
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isDebugLoading, setIsDebugLoading] = useState(false);
  const [premium, setPremium] = useState<string>("");
  const [assetAmount, setAssetAmount] = useState<string>("");
  const [assetAddress, setAssetAddress] = useState<string>(""); 

  const { getOptions } = useGetOption();
  const { updateOption } = useUpdateOption();
  // const { blockhain_deleteOption } = useDeleteOption();
  const { blockhain_deleteOption } = blockchainDeleteOption();
  const { blockhain_buyOption } = blockchainBuyOption();

  const handleGetOptions = async (type: "seller" | "buyer") => {
    setIsDebugLoading(true);
    try {
        const queryAddress = updatedAddress.trim() === "" ? "null" : updatedAddress;
        const options = await getOptions(type, updatedAddress);
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
        buyer_address: updatedAddress,
      });
      setDebugResult(updated);
      toast.success("Adresse du buyer mise à jour avec succès");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour du buyer");
    } finally {
      setIsDebugLoading(false);
    }
  };

  const handleBuyOption = async () => {
    setIsDebugLoading(true);
    try {
      await blockhain_buyOption(debugId);
      setDebugResult({ message: "Option achetée avec succès" });
      toast.success("Option bought successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error buying option");
    } finally {
      setIsDebugLoading(false);
    }
  };

  const handleUpdateAssetTransfered = async (value: boolean) => {
    setIsDebugLoading(true);
    try {
      const updated = await updateOption(Number(debugId), {
        asset_transfered: value,
      });
      setDebugResult(updated);
      toast.success(
        `Asset marqué comme ${value ? "transféré" : "non transféré"} avec succès`
      );
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour du transfert");
    } finally {
      setIsDebugLoading(false);
    }
  };

  const handleDeleteOption = async () => {
    setIsDebugLoading(true);
    try {
      // await deleteOption(Number(debugId));
      await blockhain_deleteOption(debugId);
      setDebugResult({ message: "Option supprimée avec succès" });
      toast.success("Option supprimée avec succès");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDebugLoading(false);
    }
  };

  return (
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
                value={updatedAddress}
                onChange={(e) => setUpdatedAddress(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Option ID"
                value={debugId}
                onChange={(e) => setDebugId(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Premium Amount"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
                className="flex-1"
                type="text"
              />
              <Input
                placeholder="Asset Amount"
                value={assetAmount}
                onChange={(e) => setAssetAmount(e.target.value)}
                className="flex-1"
                type="text"
              />
              <Input
                placeholder="Asset Address"
                value={assetAddress}
                onChange={(e) => setAssetAddress(e.target.value)}
                className="flex-1"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Get Operations</h3>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => handleGetOptions("seller")}
                  disabled={isDebugLoading || !updatedAddress}
                >
                  Get Seller Options
                </Button>
                <Button
                  onClick={() => handleGetOptions("buyer")}
                  disabled={isDebugLoading || !updatedAddress}
                >
                  Get Buyer Options
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Update Operations</h3>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleUpdateBuyer}
                  disabled={isDebugLoading || !debugId || !updatedAddress}
                  variant="outline"
                >
                  Update Buyer
                </Button>
                <Button
                  onClick={handleBuyOption}
                  disabled={isDebugLoading  !debugId  !premium}
                  variant="outline"
                >
                  Buy Option
                </Button>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Transfer Asset</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateAssetTransfered(true)}
                      disabled={isDebugLoading || !debugId}
                      variant="outline"
                    >
                      Mark as Transferred
                    </Button>

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

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Result:</h3>
            <pre className="bg-gray-600 p-4 rounded-lg overflow-auto max-h-60">
              {debugResult ? JSON.stringify(debugResult, null, 2) : "No result yet"}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
