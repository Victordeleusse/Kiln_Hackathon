"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGetOption } from "@/hooks/useGetOption";
import { useAccount } from "wagmi";
import { StakingDashboardSkeleton } from "@/components/sections/stakingDashboardSkeleton";
import { useDeleteOption, useBlockchainDeleteOption } from "@/hooks/useDeleteOption";

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

export function PutOptionList() {
  const { address } = useAccount();
  const { data: options, isLoading } = useGetOption("seller", String(address));

  const { blockhainDeleteOption, isLoading: isDeleting } = useBlockchainDeleteOption();

  if (isLoading) {
    return <StakingDashboardSkeleton />;
  }

  // Filter options based on buyer_address
  const availableOptions = options?.filter((option: OptionData) => !option.buyer_address) || [];
  const boughtOptions = options?.filter((option: OptionData) => option.buyer_address) || [];

  const handleDelete = async (id: number) => {
    blockhainDeleteOption(String(id));
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg mb-10 mt-10">
      <CardContent>
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-fit">
            <TabsTrigger value="available" className="text-lg py-1">
              Available Options ({availableOptions.length})
            </TabsTrigger>
            <TabsTrigger value="bought" className="text-lg py-1">
              Bought Options ({boughtOptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
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
                  {availableOptions.map((option: OptionData) => (
                    <TableRow key={option.id}>
                      <TableCell className="text-lg py-6">${option.strike_price}</TableCell>
                      <TableCell className="text-lg py-6">${option.premium_price}</TableCell>
                      <TableCell className="text-lg py-6">
                        {new Date(option.expiry).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-lg py-6 font-mono">
                        {option.asset.slice(0, 6)}...{option.asset.slice(-4)}
                      </TableCell>
                      <TableCell className="text-lg py-6">{option.amount}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(option.id_blockchain)}
                          className="h-10 w-10"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {availableOptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-lg text-muted-foreground">
                        No available options found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="bought">
            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-lg py-6">Strike Price</TableHead>
                    <TableHead className="text-lg py-6">Premium Price</TableHead>
                    <TableHead className="text-lg py-6">Expiry</TableHead>
                    <TableHead className="text-lg py-6">Asset</TableHead>
                    <TableHead className="text-lg py-6">Amount</TableHead>
                    <TableHead className="text-lg py-6">Buyer Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boughtOptions.map((option: OptionData) => (
                    <TableRow key={option.id}>
                      <TableCell className="text-lg py-6">${option.strike_price}</TableCell>
                      <TableCell className="text-lg py-6">${option.premium_price}</TableCell>
                      <TableCell className="text-lg py-6">
                        {new Date(option.expiry).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-lg py-6 font-mono">
                        {option.asset.slice(0, 6)}...{option.asset.slice(-4)}
                      </TableCell>
                      <TableCell className="text-lg py-6">{option.amount}</TableCell>
                      <TableCell className="text-lg py-6 font-mono">
                        {option.buyer_address?.slice(0, 6)}...{option.buyer_address?.slice(-4)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {boughtOptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-lg text-muted-foreground">
                        No bought options found
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
