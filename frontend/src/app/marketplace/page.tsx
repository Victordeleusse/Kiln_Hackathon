"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useGetOptions } from "@/hooks/useGetOptions";

export default function Marketplace() {
  const { options } = useGetOptions();

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center py-4">
            Marketplace – Buy Put Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg py-6">ETH Amount</TableHead>
                  <TableHead className="text-lg py-6">Strike Price (USD)</TableHead>
                  <TableHead className="text-lg py-6">Expiry</TableHead>
                  <TableHead className="text-lg py-6">Seller Address</TableHead>
                  <TableHead className="text-right text-lg py-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {options.map((option, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-lg py-6">{option.assetAmount} ETH</TableCell>
                    <TableCell className="text-lg py-6">${option.strikePrice.toLocaleString()}</TableCell>
                    <TableCell className="text-lg py-6">
                      {format(new Date(option.expiry * 1000), "MMM dd, yyyy HH:mm")} UTC
                    </TableCell>
                    <TableCell className="text-lg py-6 font-mono">
                      {option.seller.slice(0, 6)}...{option.seller.slice(-4)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => console.log(`Buying option ${index}`)} className="md:text-lg">
                        Buy Option
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {options.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-lg text-muted-foreground">
                      No available options found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

