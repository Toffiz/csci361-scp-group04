'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, User, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatCurrencyKZT } from '@/lib/currency';
import { Package, Search, ShoppingCart, Store, Plus, Edit, Trash2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Mock data
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

const mockSuppliers = [
  { id: 'supplier-1', name: 'Almaty Grain Trading LLC' },
  { id: 'supplier-2', name: 'Kazakhstan Food Distributors' },
  { id: 'supplier-3', name: 'Astana Wholesale Co.' },
];

interface CatalogFilters {
  search: string;
  supplier: string;
}

async function fetchCatalog(filters: CatalogFilters): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('products');
  let products = stored ? JSON.parse(stored) : mockProducts;
  
  if (filters.search) {
    const query = filters.search.toLowerCase();
    products = products.filter(
      (p: Product) =>
        !p.archived &&
        (p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)))
    );
  }

  if (filters.supplier) {
    products = products.filter((p: Product) => p.supplierId === filters.supplier);
  }
  
  return products.filter((p: Product) => !p.archived);
}

async function addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'archived'>): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('products');
  const products = stored ? JSON.parse(stored) : mockProducts;
  
  const newProduct: Product = {
    ...productData,
    id: `product-${Date.now()}`,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  products.push(newProduct);
  localStorage.setItem('products', JSON.stringify(products));
  return newProduct;
}

async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('products');
  const products = stored ? JSON.parse(stored) : mockProducts;
  
  const index = products.findIndex((p: Product) => p.id === id);
  if (index === -1) throw new Error('Product not found');
  
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem('products', JSON.stringify(products));
  return products[index];
}

async function deleteProduct(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('products');
  const products = stored ? JSON.parse(stored) : mockProducts;
  
  const index = products.findIndex((p: Product) => p.id === id);
  if (index !== -1) {
    products[index].archived = true;
    localStorage.setItem('products', JSON.stringify(products));
  }
}

export default function CatalogPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [supplier, setSupplier] = useState('');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    unit: 'kg',
    priceKZT: 0,
    stock: 0,
    moq: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem('session');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['catalog', search, supplier],
    queryFn: () => fetchCatalog({ search, supplier }),
  });

  const addProductMutation = useMutation({
    mutationFn: (data: typeof productForm) => {
      if (!user) throw new Error('Not authenticated');
      return addProduct({
        ...data,
        supplierId: user.companyId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', unit: 'kg', priceKZT: 0, stock: 0, moq: 0 });
      toast({ title: 'Success', description: 'Product added successfully' });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      setEditingProduct(null);
      toast({ title: 'Success', description: 'Product updated successfully' });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast({ title: 'Success', description: 'Product removed successfully' });
    },
  });

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  const isConsumer = user.role === UserRole.CONSUMER;
  const isSupplier = [UserRole.OWNER, UserRole.ADMIN, UserRole.SALES].includes(user.role);

  const handleSaveProduct = () => {
    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct.id,
        data: productForm,
      });
    } else {
      addProductMutation.mutate(productForm);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      unit: product.unit,
      priceKZT: product.priceKZT,
      stock: product.stock,
      moq: product.moq,
    });
    setShowAddProduct(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Catalog</h1>
          <p className="text-muted-foreground mt-2">
            {isConsumer ? 'Search and browse products from suppliers' : 'Manage your product catalog'}
          </p>
        </div>
        <div className="flex gap-2">
          {isConsumer && cartCount > 0 && (
            <Button className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({cartCount})
            </Button>
          )}
          {isSupplier && (
            <Button onClick={() => {
              setShowAddProduct(!showAddProduct);
              setEditingProduct(null);
              setProductForm({ name: '', description: '', unit: 'kg', priceKZT: 0, stock: 0, moq: 0 });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {isSupplier && (showAddProduct || editingProduct) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
            <CardDescription>
              {editingProduct ? 'Update product information' : 'Create a new product in your catalog'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Premium Wheat Flour"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="kg, L, pcs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="High-quality product description..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceKZT">Price (KZT)</Label>
                  <Input
                    id="priceKZT"
                    type="number"
                    value={productForm.priceKZT || ''}
                    onChange={(e) => setProductForm({ ...productForm, priceKZT: Number(e.target.value) })}
                    placeholder="180"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={productForm.stock || ''}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moq">Min Order Qty</Label>
                  <Input
                    id="moq"
                    type="number"
                    value={productForm.moq || ''}
                    onChange={(e) => setProductForm({ ...productForm, moq: Number(e.target.value) })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProduct}
                  disabled={
                    !productForm.name ||
                    !productForm.unit ||
                    productForm.priceKZT <= 0 ||
                    productForm.stock < 0 ||
                    productForm.moq <= 0 ||
                    addProductMutation.isPending ||
                    updateProductMutation.isPending
                  }
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingProduct ? 'Update' : 'Add'} Product
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setProductForm({ name: '', description: '', unit: 'kg', priceKZT: 0, stock: 0, moq: 0 });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {isConsumer && (
          <div>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All Suppliers</option>
              {mockSuppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {(search || supplier) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setSupplier('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => {
          const supplierName = mockSuppliers.find((s) => s.id === product.supplierId)?.name || 'Unknown Supplier';
          const canManage = isSupplier && product.supplierId === user.companyId;
          
          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Package className="h-10 w-10 text-muted-foreground" />
                  {product.stock < 100 && (
                    <Badge variant="destructive">Low Stock</Badge>
                  )}
                </div>
                <CardTitle className="text-xl mt-4">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
                {isConsumer && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Store className="h-4 w-4" />
                    <span>{supplierName}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
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
                
                {isConsumer && (
                  <Button 
                    className="w-full" 
                    onClick={() => addToCart(product.id)}
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                    {cart[product.id] && ` (${cart[product.id]})`}
                  </Button>
                )}

                {canManage && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                      disabled={deleteProductMutation.isPending}
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {products?.length === 0 && (
          <Card className="md:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {search || supplier ? 'No products found matching your filters' : 'Catalog is empty'}
              </p>
              {isSupplier && !search && !supplier && (
                <Button 
                  className="mt-4" 
                  onClick={() => setShowAddProduct(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
