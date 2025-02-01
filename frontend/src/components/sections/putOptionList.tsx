"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type OptionData = {
  id: number;
  address: number;
  balance: number;
  totalPrice: number;
  contract: string;
};


export function PutOptionList() {
  const availableOptions = fakeData.filter((option) => option.address === 0);
  const boughtOptions = fakeData.filter((option) => option.address > 0);

  const handleDelete = (id: number) => {
    console.log("Deleting option:", id);
    // Add delete logic here
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
                    <TableHead className="text-lg py-6">Balance</TableHead>
                    <TableHead className="text-lg py-6">Total Price</TableHead>
                    <TableHead className="text-lg py-6">Contract</TableHead>
                    <TableHead className="text-right text-lg py-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableOptions.map((option) => (
                    <TableRow key={option.id}>
                      <TableCell className="text-lg py-6">{option.balance} ETH</TableCell>
                      <TableCell className="text-lg py-6">${option.totalPrice}</TableCell>
                      <TableCell className="text-lg py-6 font-mono">
                        {option.contract.slice(0, 6)}...{option.contract.slice(-4)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(option.id)}
                          className="h-10 w-10"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {availableOptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-lg text-muted-foreground">
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
                    <TableHead className="text-lg py-6">Balance</TableHead>
                    <TableHead className="text-lg py-6">Total Price</TableHead>
                    <TableHead className="text-lg py-6">Contract</TableHead>
                    <TableHead className="text-lg py-6">Buyer Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boughtOptions.map((option) => (
                    <TableRow key={option.id}>
                      <TableCell className="text-lg py-6">{option.balance} ETH</TableCell>
                      <TableCell className="text-lg py-6">${option.totalPrice}</TableCell>
                      <TableCell className="text-lg py-6 font-mono">
                        {option.contract.slice(0, 6)}...{option.contract.slice(-4)}
                      </TableCell>
                      <TableCell className="text-lg py-6 font-mono">
                        {`Address ${option.address}`}
                      </TableCell>
                    </TableRow>
                  ))}
                  {boughtOptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-lg text-muted-foreground">
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

const fakeData: OptionData[] = [
  {
    id: 1,
    address: 6,
    balance: 1,
    totalPrice: 10,
    contract: "0x0000000000000000000000000000000000000000",
  },
  {
    id: 2,
    address: 1,
    balance: 2,
    totalPrice: 20,
    contract: "x0000000000000000000000000000000000000000",
  },
  {
    id: 3,
    address: 2,
    balance: 3,
    totalPrice: 30,
    contract: "0x0000000000000000000000000000000000000000",
  },
  {
    id: 4,
    address: 3,
    balance: 4,
    totalPrice: 40,
    contract: "0x0000000000000000000000000000000000000000",
  },
  {
    id: 5,
    address: 4,
    balance: 5,
    totalPrice: 50,
    contract: "0x0000000000000000000000000000000000000000",
  },
  {
    id: 1,
    address: 0,
    balance: 1,
    totalPrice: 10,
    contract: "0x0000000000000000000000000000000000000000",
  },
  {
    id: 2,
    address: 0,
    balance: 2,
    totalPrice: 20,
    contract: "x0000000000000000000000000000000000000000",
  },
  {
    id: 3,
    address: 0,
    balance: 3,
    totalPrice: 30,
    contract: "0x0000000000000000000000000000000000000000",
  },
  {
    id: 4,
    address: 0,
    balance: 4,
    totalPrice: 40,
    contract: "0x0000000000000000000000000000000000000000",
  },
  {
    id: 5,
    address: 0,
    balance: 5,
    totalPrice: 50,
    contract: "0x0000000000000000000000000000000000000000",
  },
]


