import { NextResponse } from 'next/server';
import { LinkStatus } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Mock approval logic
  const response = {
    data: { id, status: LinkStatus.APPROVED },
    success: true,
    message: 'Link approved successfully',
  };

  return NextResponse.json(response);
}
