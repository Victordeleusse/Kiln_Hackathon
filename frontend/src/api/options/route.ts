import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { optionManagerABI, OPTION_MANAGER_ADDRESS } from '../../config/contract-config';
import { parseAbi } from 'viem';

const prisma = new PrismaClient();

// const publicClient = createPublicClient({
//   chain: sepolia,
//   transport: http(process.env.PROVIDER_URL)
// });

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const putOption = await prisma.putOption.create({
      data: {
        strike_price: parseFloat(data.strike_price),
        premium_price: parseFloat(data.premium_price),
        expiry: new Date(data.expiry),
        asset: data.asset,
        seller_address: data.seller_address,
        asset_transfered: false
      }
    });

    console.log('Put option created on database:', putOption);
    // const unwatch = publicClient.watchEvent({
    //   address: OPTION_MANAGER_ADDRESS,
    //   event: parseAbiItem('event OptionCreated(uint256,uint8,address,uint256,uint256,address,uint256,uint256)'),
    //   onLogs: (logs) => {
    //     // Update database with blockchain data if needed
    //     console.log('Option created on blockchain:', logs);
    //     unwatch();
    //   }
    // });

    return NextResponse.json({ 
      success: true, 
      data: putOption 
    });

  } catch (error) {
    console.error('Error creating put option:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create put option' 
    }, { status: 500 });
  }
}

function parseAbiItem(abiString: string) {
    try {
        return parseAbi([abiString])[0];
    } catch (error) {
        console.error('Error parsing ABI item:', error);
        return undefined;
    }
}
