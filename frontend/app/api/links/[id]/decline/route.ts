import { NextResponse } from 'next/server';
import { LinkStatus } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  const response = {
    data: { id, status: LinkStatus.DECLINED },
    success: true,
    message: 'Link declined',
  };

  return NextResponse.json(response);
}
