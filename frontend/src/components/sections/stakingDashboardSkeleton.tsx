"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function StakingDashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center py-4">
            <Skeleton className="h-12 w-64 mx-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg py-6">
                    <Skeleton className="h-8 w-24" />
                  </TableHead>
                  <TableHead className="text-lg py-6">
                    <Skeleton className="h-8 w-32" />
                  </TableHead>
                  <TableHead className="text-right text-lg py-6">
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((item) => (
                  <TableRow key={item}>
                    <TableCell className="text-lg py-6">
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell className="text-lg py-6">
                      <Skeleton className="h-8 w-40" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-10 w-40 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Updated main component with skeleton
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
                {balanceList.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow>
                      <TableCell className="text-lg py-6">
                        {item.ethBalance.toLocaleString()} ETH
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
                      <TableRow className="bg-muted/50">
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
