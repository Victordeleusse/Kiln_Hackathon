import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        success: false,
        error: 'Valid option ID is required'
      }, { status: 400 });
    }

    const data = await req.json();
    const { buyer_address, asset_transfered } = data;

    const updateData: Partial<{ buyer_address: string; asset_transfered: boolean }> = {};
    if (buyer_address !== undefined) updateData.buyer_address = buyer_address;
    if (asset_transfered !== undefined) updateData.asset_transfered = asset_transfered;

    const updatedOption = await prisma.putOption.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedOption
    });
  } catch (error) {
    console.error('Error updating put option:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to update put option'
    }, { status: 500 });
  }
}


export async function DELETE(req: Request, context: { params: { id: string } }) {
    try {
        const id = context.params.id;

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json({
                success: false,
                error: 'Valid option ID is required'
            }, { status: 400 });
        }
        
        await prisma.putOption.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({
            success: true,
            message: 'Put option deleted successfully'
        });
        } catch (error) {
        console.error('Error deleting put option:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to delete put option'
        }, { status: 500 });
    }
}