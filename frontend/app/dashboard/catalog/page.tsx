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
    name: 'Мука пшеничная высший сорт',
    description: 'Качественная мука для выпечки хлеба и кондитерских изделий',
    priceKZT: 180,
    unit: 'кг',
    stock: 5000,
    moq: 100,
    supplierId: 'supplier-1',
    supplierName: 'ТОО "Поставщик"',
    category: 'Продукты питания',
    archived: false,
  },
  {
    id: '2',
    name: 'Сахар-песок',
    description: 'Сахар белый кристаллический',
    priceKZT: 320,
    unit: 'кг',
    stock: 3000,
    moq: 50,
    supplierId: 'supplier-1',
    supplierName: 'ТОО "Поставщик"',
    category: 'Продукты питания',
    archived: false,
  },
  {
    id: '3',
    name: 'Масло подсолнечное',
    description: 'Рафинированное дезодорированное масло',
    priceKZT: 850,
    unit: 'л',
    stock: 80,
    moq: 20,
    supplierId: 'supplier-1',
    supplierName: 'ТОО "Поставщик"',
    category: 'Продукты питания',
    archived: false,
  },
  {
    id: '4',
    name: 'Рис круглозерный',
    description: 'Премиум качество для плова',
    priceKZT: 450,
    unit: 'кг',
    stock: 1200,
    moq: 100,
    supplierId: 'supplier-1',
    supplierName: 'ТОО "Поставщик"',
    category: 'Продукты питания',
    archived: false,
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
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
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
