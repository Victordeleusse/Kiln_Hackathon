
"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PutForm } from "@/components/forms/putForm";
import { getEthOnchainStakes } from "@/actions/kiln";
import { useQuery } from "@tanstack/react-query";
import { StakingDashboardSkeleton } from "@/components/sections/stakingDashboardSkeleton";

export default function StakingDashboard() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { isPending, data } = useQuery({
    queryKey: ['kiln'],
    queryFn: getEthOnchainStakes,
  });

  const toggleAccordion = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (isPending) {
    return <StakingDashboardSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center py-4">
            Kiln Staking Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg py-6">ETH Balance</TableHead>
                  <TableHead className="text-lg py-6">Total Price (USD)</TableHead>
                  <TableHead className="text-right text-lg py-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow>
                      <TableCell className="text-lg py-6">
                        {item.balance.toLocaleString()} ETH
                      </TableCell>
                      <TableCell className="text-lg py-6">
                        ${item.totalPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="secondary"
                          onClick={() => toggleAccordion(item.id)}
                          className="gap-2 md:text-lg"
                        >
                          {expandedRow === item.id ? "Close creation" : "Create Option"}
                          {expandedRow === item.id ? <ChevronUp className="h-4 w-4" />
                            :
                            <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRow === item.id && (
                      <TableRow className="bg-muted/50" key={item.id}>
                        <TableCell colSpan={3} className="py-6">
                          <PutForm address="0x0000000000000000" />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

