import { Product, CreateProductDto, ApiResponse } from '@/types';
import { NextResponse } from 'next/server';

// In-memory mock products
let products: Product[] = [
  {
    id: 'prod-1',
    supplierId: 'supplier-1',
    name: 'Мука пшеничная высший сорт',
    description: 'Высококачественная мука для выпечки',
    unit: 'кг',
    priceKZT: 250,
    stock: 5000,
    moq: 50,
    archived: false,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'prod-2',
    supplierId: 'supplier-1',
    name: 'Сахар белый кристаллический',
    description: 'Сахар-песок высшего качества',
    unit: 'кг',
    priceKZT: 380,
    stock: 3000,
    moq: 25,
    archived: false,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'prod-3',
    supplierId: 'supplier-1',
    name: 'Масло подсолнечное рафинированное',
    description: 'Рафинированное дезодорированное масло',
    unit: 'л',
    priceKZT: 650,
    stock: 1200,
    moq: 10,
    archived: false,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'prod-4',
    supplierId: 'supplier-1',
    name: 'Соль пищевая йодированная',
    description: 'Мелкого помола с йодом',
    unit: 'кг',
    priceKZT: 120,
    stock: 8000,
    moq: 100,
    archived: false,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const linked = searchParams.get('linked') === 'true';

  let filtered = products.filter((p) => !p.archived);

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }

  // If linked, show full details including prices
  const response: ApiResponse<Product[]> = {
    data: filtered,
    success: true,
  };

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const body: CreateProductDto = await request.json();

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    supplierId: 'supplier-1',
    ...body,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.push(newProduct);

  const response: ApiResponse<Product> = {
    data: newProduct,
    success: true,
    message: 'Product created successfully',
  };

  return NextResponse.json(response);
}
