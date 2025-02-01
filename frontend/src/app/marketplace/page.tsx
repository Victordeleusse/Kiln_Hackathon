
"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"; // Pour formater la date proprement

const fakeOptions = [
  { id: 1, balance: 2, totalPrice: 5000, seller: "0xA1b2C3d4E5f6G7H8I9J0", expiry: new Date("2025-02-15T18:00:00Z") },
  { id: 2, balance: 1.5, totalPrice: 3750, seller: "0xB2c3D4e5F6g7H8I9J0A1", expiry: new Date("2025-03-10T12:30:00Z") },
  { id: 3, balance: 3, totalPrice: 7500, seller: "0xC3d4E5f6G7h8I9J0A1B2", expiry: new Date("2025-04-05T09:15:00Z") },
];

export default function Marketplace() {
  const handleBuyOption = (id: number) => {
    console.log(`Buying option with ID: ${id}`);
    alert(`Option ${id} purchased successfully!`);
  };

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
                  <TableHead className="text-lg py-6">ETH Balance</TableHead>
                  <TableHead className="text-lg py-6">Total Price (USD)</TableHead>
                  <TableHead className="text-lg py-6">Expiry</TableHead>
                  <TableHead className="text-lg py-6">Seller Address</TableHead>
                  <TableHead className=" text-center text-lg py-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fakeOptions.map((option) => (
                  <TableRow key={option.id}>
                    <TableCell className="text-lg py-6">{option.balance} ETH</TableCell>
                    <TableCell className="text-lg py-6">${option.totalPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-lg py-6">
                      {format(option.expiry, "MMM dd, yyyy HH:mm")} UTC
                    </TableCell>
                    <TableCell className="text-lg py-6 font-mono">
                      {option.seller}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => handleBuyOption(option.id)} className="md:text-lg">
                        Buy Option
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {fakeOptions.length === 0 && (
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

