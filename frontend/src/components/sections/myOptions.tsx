"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useGetOption } from "@/hooks/useGetOption";
import { StakingDashboardSkeleton } from "@/components/sections/stakingDashboardSkeleton";
import { BlockchainSendAssetToContract } from "@/hooks/useUpdateOption";

type OptionData = {
  id: number;
  id_blockchain: number;
  strike_price: number;
  premium_price: number;
  expiry: string;
  asset: string;
  amount: number;
  seller_address: string;
  buyer_address: string | null;
  asset_transfered: boolean;
  createdAt: string;
  updatedAt: string;
};

export function MyOptions() {
  const { address } = useAccount();
  const { data: options, isLoading } = useGetOption("buyer", String(address));

  const { blockchain_sendAssetToContract } = BlockchainSendAssetToContract();

  if (isLoading) {
    return <StakingDashboardSkeleton />;
  }

  // Filtrer les options achetées
  const depositedOptions = options?.filter((option: OptionData) => option.asset_transfered) || [];
  const notDepositedOptions = options?.filter((option: OptionData) => !option.asset_transfered) || [];

  const handleDeposit = async (optionId: string, asset: string, amount: string) => {
    blockchain_sendAssetToContract({ optionId, asset, amount });
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg mb-10 mt-10">
      <CardContent>
        <Tabs defaultValue="deposited" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-fit">
            <TabsTrigger value="deposited" className="text-lg py-1">
              Deposited Options ({depositedOptions.length})
            </TabsTrigger>
            <TabsTrigger value="notDeposited" className="text-lg py-1">
              Not Deposited Options ({notDepositedOptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposited">
            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-lg py-6">Strike Price</TableHead>
                    <TableHead className="text-lg py-6">Premium Price</TableHead>
                    <TableHead className="text-lg py-6">Expiry</TableHead>
                    <TableHead className="text-lg py-6">Asset</TableHead>
                    <TableHead className="text-lg py-6">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depositedOptions.map((option: OptionData) => (
                    <TableRow key={option.id}>
                      <TableCell className="text-lg py-6">${option.strike_price}</TableCell>
                      <TableCell className="text-lg py-6">${option.premium_price}</TableCell>
                      <TableCell className="text-lg py-6">{new Date(option.expiry).toLocaleDateString()}</TableCell>
                      <TableCell className="text-lg py-6 font-mono">{option.asset.slice(0, 6)}...{option.asset.slice(-4)}</TableCell>
                      <TableCell className="text-lg py-6">{option.amount}</TableCell>
                    </TableRow>
                  ))}
                  {depositedOptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-lg text-muted-foreground">
                        No deposited options found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="notDeposited">
            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-lg py-6">Strike Price</TableHead>
                    <TableHead className="text-lg py-6">Premium Price</TableHead>
                    <TableHead className="text-lg py-6">Expiry</TableHead>
                    <TableHead className="text-lg py-6">Asset</TableHead>
                    <TableHead className="text-lg py-6">Amount</TableHead>
                    <TableHead className="text-right text-lg py-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notDepositedOptions.map((option: OptionData) => (
                    <TableRow key={option.id}>
                      <TableCell className="text-lg py-6">${option.strike_price}</TableCell>
                      <TableCell className="text-lg py-6">${option.premium_price}</TableCell>
                      <TableCell className="text-lg py-6">{new Date(option.expiry).toLocaleDateString()}</TableCell>
                      <TableCell className="text-lg py-6 font-mono">{option.asset.slice(0, 6)}...{option.asset.slice(-4)}</TableCell>
                      <TableCell className="text-lg py-6">{option.amount}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="default"
                          onClick={() => handleDeposit(String(option.id_blockchain), option.asset, String(option.amount))}
                          className="h-10 px-6"
                        >
                          Deposit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {notDepositedOptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-lg text-muted-foreground">
                        No options to deposit
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}
