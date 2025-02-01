import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { optionManagerABI, OPTION_MANAGER_ADDRESS } from '../../../config/contract-config';
import { parseAbi } from 'viem';

const prisma = new PrismaClient();

// const publicClient = createPublicClient({
//   chain: sepolia,
//   transport: http(process.env.PROVIDER_URL)
// });

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const putOption = await prisma.PutOption.create({
      data: {
        id_blockchain: parseFloat(data.id_blockchain), 
        strike_price: parseFloat(data.strike_price),
        premium_price: parseFloat(data.premium_price),
        expiry: new Date(data.expiry),
        asset: data.asset,
        amount: data.amount,
        seller_address: data.seller_address,
        asset_transfered: false
      }
    });

    console.log('Put option created on database:', putOption);

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerAddress = searchParams.get('seller');
    const buyerAddress = searchParams.get('buyer');
    
    if (!sellerAddress && !buyerAddress) {
      return NextResponse.json({
        success: false,
        error: 'Must provide either seller or buyer address'
      }, { status: 400 });
    }

    const options = await prisma.putOption.findMany({
      where: {
        ...(sellerAddress && { seller_address: sellerAddress }),
        ...(buyerAddress === "null" ? { buyer_address: null } : buyerAddress ? { buyer_address: buyerAddress } : {})
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
        success: true,
        data: options
    });
    } catch (error) {
        console.error('Error fetching put options:', error);
        return NextResponse.json({
        success: false,
        error: 'Failed to fetch put options'
    }, { status: 500 });
  }
}
