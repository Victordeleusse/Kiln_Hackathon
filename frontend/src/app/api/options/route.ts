import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Creating put option with data:", data);

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
        ...(buyerAddress && { buyer_address: buyerAddress })
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