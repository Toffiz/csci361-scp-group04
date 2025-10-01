'use client';

import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrencyKZT } from '@/lib/currency';
import { Package } from 'lucide-react';
import { useState } from 'react';

// Mock data for static export
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wheat Flour',
    description: 'High-quality flour for bread and pastry baking',
    priceKZT: 180,
    unit: 'kg',
    stock: 5000,
    moq: 100,
    supplierId: 'supplier-1',
    archived: false,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    name: 'Granulated Sugar',
    description: 'White crystalline sugar',
    priceKZT: 320,
    unit: 'kg',
    stock: 3000,
    moq: 50,
    supplierId: 'supplier-1',
    archived: false,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '3',
    name: 'Sunflower Oil',
    description: 'Refined deodorized oil',
    priceKZT: 850,
    unit: 'L',
    stock: 80,
    moq: 20,
    supplierId: 'supplier-1',
    archived: false,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '4',
    name: 'Round Grain Rice',
    description: 'Premium quality for pilaf',
    priceKZT: 450,
    unit: 'kg',
    stock: 1200,
    moq: 100,
    supplierId: 'supplier-1',
    archived: false,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
];

async function fetchCatalog(search: string): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  let products = mockProducts;
  
  if (search) {
    const query = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }
  
  return products;
}

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['catalog', search],
    queryFn: () => fetchCatalog(search),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Catalog</h1>
          <p className="text-muted-foreground mt-2">
            Available products from suppliers
          </p>
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Package className="h-10 w-10 text-muted-foreground" />
                {product.stock < 100 && (
                  <Badge variant="destructive">Low</Badge>
                )}
              </div>
              <CardTitle className="text-xl mt-4">{product.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {formatCurrencyKZT(product.priceKZT)}
                </span>
                <span className="text-muted-foreground text-sm">
                  per {product.unit}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>In stock: {product.stock} {product.unit}</div>
                <div>Min order: {product.moq} {product.unit}</div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {products?.length === 0 && (
          <Card className="md:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {search ? 'No products found' : 'Catalog is empty'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
