import { Link, LinkStatus, LinkRequest, ApiResponse } from '@/types';
import { NextResponse } from 'next/server';

// In-memory mock data
let links: Link[] = [
  {
    id: 'link-1',
    supplierId: 'supplier-1',
    supplierName: 'ТОО "Поставщик"',
    consumerId: 'consumer-1',
    consumerName: 'Ресторан "Астана"',
    status: LinkStatus.APPROVED,
    requestedAt: '2025-09-15T10:00:00Z',
    respondedAt: '2025-09-16T14:30:00Z',
    respondedBy: 'owner-1',
    archived: false,
  },
  {
    id: 'link-2',
    supplierId: 'supplier-1',
    supplierName: 'ТОО "Поставщик"',
    consumerId: 'consumer-2',
    consumerName: 'Отель "Rixos"',
    status: LinkStatus.PENDING,
    requestedAt: '2025-09-28T08:00:00Z',
    archived: false,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const role = searchParams.get('role');

  let filtered = links.filter((l) => !l.archived);

  if (status) {
    filtered = filtered.filter((l) => l.status === status);
  }

  const response: ApiResponse<Link[]> = {
    data: filtered,
    success: true,
  };

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const body: LinkRequest = await request.json();

  const newLink: Link = {
    id: `link-${Date.now()}`,
    supplierId: body.supplierId,
    supplierName: 'ТОО "Поставщик"',
    consumerId: body.consumerId,
    consumerName: 'New Consumer',
    status: LinkStatus.PENDING,
    requestedAt: new Date().toISOString(),
    archived: false,
  };

  links.push(newLink);

  const response: ApiResponse<Link> = {
    data: newLink,
    success: true,
    message: 'Link request sent successfully',
  };

  return NextResponse.json(response);
}
