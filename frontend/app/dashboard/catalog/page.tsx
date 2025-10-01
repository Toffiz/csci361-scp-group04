'use client';

import { useQuery } from '@tanstack/react-query';
import { Product, ApiResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrencyKZT } from '@/lib/currency';
import { Package } from 'lucide-react';
import { useState } from 'react';

async function fetchCatalog(search: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  params.append('linked', 'true');
  
  const res = await fetch(`/api/catalog?${params.toString()}`);
  const data: ApiResponse<Product[]> = await res.json();
  return data.data;
}

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['catalog', search],
    queryFn: () => fetchCatalog(search),
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Каталог</h1>
          <p className="text-muted-foreground mt-2">
            Доступные товары от поставщиков
          </p>
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Поиск товаров..."
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
                  <Badge variant="destructive">Мало</Badge>
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
                  за {product.unit}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>В наличии: {product.stock} {product.unit}</div>
                <div>Мин. заказ: {product.moq} {product.unit}</div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {products?.length === 0 && (
          <Card className="md:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {search ? 'Товары не найдены' : 'Каталог пуст'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
