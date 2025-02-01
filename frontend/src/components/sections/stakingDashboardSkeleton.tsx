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

