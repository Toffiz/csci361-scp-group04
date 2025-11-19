'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Plus, Minus, Trash2, Check, X } from 'lucide-react';
import { Order, OrderStatus, Product, User, UserRole } from '@/types';
import { formatCurrencyKZT } from '@/lib/currency';
import { useToast } from '@/components/ui/use-toast';

interface CartItem {
  product: Product;
  quantity: number;
}

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
  {
    id: '5',
    name: 'Buckwheat Groats',
    description: 'Organic buckwheat for healthy meals',
    priceKZT: 380,
    unit: 'kg',
    stock: 800,
    moq: 50,
    supplierId: 'supplier-2',
    archived: false,
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: '6',
    name: 'Pasta Vermicelli',
    description: 'Durum wheat pasta',
    priceKZT: 290,
    unit: 'kg',
    stock: 1500,
    moq: 100,
    supplierId: 'supplier-2',
    archived: false,
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: '7',
    name: 'Iodized Salt',
    description: 'Fine table salt enriched with iodine',
    priceKZT: 120,
    unit: 'kg',
    stock: 2000,
    moq: 200,
    supplierId: 'supplier-2',
    archived: false,
    createdAt: new Date('2024-01-22').toISOString(),
    updatedAt: new Date('2024-01-22').toISOString(),
  },
  {
    id: '8',
    name: 'Black Tea Leaves',
    description: 'Premium Ceylon black tea',
    priceKZT: 1200,
    unit: 'kg',
    stock: 300,
    moq: 10,
    supplierId: 'supplier-3',
    archived: false,
    createdAt: new Date('2024-01-25').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString(),
  },
  {
    id: '9',
    name: 'Instant Coffee',
    description: 'Freeze-dried Arabica coffee',
    priceKZT: 2800,
    unit: 'kg',
    stock: 150,
    moq: 5,
    supplierId: 'supplier-3',
    archived: false,
    createdAt: new Date('2024-01-25').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString(),
  },
  {
    id: '10',
    name: 'Dried Lentils',
    description: 'Red lentils for soups and stews',
    priceKZT: 420,
    unit: 'kg',
    stock: 600,
    moq: 50,
    supplierId: 'supplier-2',
    archived: false,
    createdAt: new Date('2024-01-28').toISOString(),
    updatedAt: new Date('2024-01-28').toISOString(),
  },
  {
    id: '11',
    name: 'Tomato Paste',
    description: 'Concentrated tomato paste 28-30% solids',
    priceKZT: 650,
    unit: 'kg',
    stock: 400,
    moq: 25,
    supplierId: 'supplier-1',
    archived: false,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: '12',
    name: 'Corn Flour',
    description: 'Fine yellow corn flour',
    priceKZT: 210,
    unit: 'kg',
    stock: 1000,
    moq: 100,
    supplierId: 'supplier-1',
    archived: false,
    createdAt: new Date('2024-02-03').toISOString(),
    updatedAt: new Date('2024-02-03').toISOString(),
  },
  {
    id: '13',
    name: 'Chickpeas',
    description: 'Dried Kabuli chickpeas',
    priceKZT: 480,
    unit: 'kg',
    stock: 700,
    moq: 50,
    supplierId: 'supplier-2',
    archived: false,
    createdAt: new Date('2024-02-05').toISOString(),
    updatedAt: new Date('2024-02-05').toISOString(),
  },
  {
    id: '14',
    name: 'Basmati Rice',
    description: 'Long grain aromatic rice from India',
    priceKZT: 680,
    unit: 'kg',
    stock: 500,
    moq: 50,
    supplierId: 'supplier-3',
    archived: false,
    createdAt: new Date('2024-02-08').toISOString(),
    updatedAt: new Date('2024-02-08').toISOString(),
  },
  {
    id: '15',
    name: 'Oat Flakes',
    description: 'Quick-cooking rolled oats',
    priceKZT: 350,
    unit: 'kg',
    stock: 900,
    moq: 100,
    supplierId: 'supplier-2',
    archived: false,
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString(),
  },
  {
    id: '16',
    name: 'Rye Flour',
    description: 'Whole grain rye flour',
    priceKZT: 220,
    unit: 'kg',
    stock: 650,
    moq: 100,
    supplierId: 'supplier-1',
    archived: false,
    createdAt: new Date('2024-02-12').toISOString(),
    updatedAt: new Date('2024-02-12').toISOString(),
  },
  {
    id: '17',
    name: 'Honey Natural',
    description: 'Pure wildflower honey',
    priceKZT: 1800,
    unit: 'kg',
    stock: 200,
    moq: 10,
    supplierId: 'supplier-3',
    archived: false,
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date('2024-02-15').toISOString(),
  },
];

const mockOrders: Order[] = [
  {
    id: 'order-1',
    supplierId: 'supplier-1',
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: 'consumer@scp.kz',
    consumerName: 'Alice Brown',
    status: OrderStatus.PENDING,
    items: [
      {
        id: 'item-1',
        productId: '1',
        productName: 'Premium Wheat Flour',
        unit: 'kg',
        quantity: 100,
        priceKZT: 180,
        totalKZT: 18000,
      },
    ],
    totalKZT: 18000,
    createdAt: new Date('2024-03-10').toISOString(),
    updatedAt: new Date('2024-03-10').toISOString(),
    archived: false,
  },
  {
    id: 'order-2',
    supplierId: 'supplier-1',
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: 'consumer@scp.kz',
    consumerName: 'Alice Brown',
    status: OrderStatus.ACCEPTED,
    items: [
      {
        id: 'item-2',
        productId: '2',
        productName: 'Granulated Sugar',
        unit: 'kg',
        quantity: 200,
        priceKZT: 320,
        totalKZT: 64000,
      },
      {
        id: 'item-3',
        productId: '3',
        productName: 'Sunflower Oil',
        unit: 'L',
        quantity: 40,
        priceKZT: 850,
        totalKZT: 34000,
      },
    ],
    totalKZT: 98000,
    createdAt: new Date('2024-03-08').toISOString(),
    updatedAt: new Date('2024-03-09').toISOString(),
    archived: false,
  },
  {
    id: 'order-3',
    supplierId: 'supplier-1',
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: 'consumer@scp.kz',
    consumerName: 'Alice Brown',
    status: OrderStatus.ACCEPTED,
    items: [
      {
        id: 'item-4',
        productId: '4',
        productName: 'Round Grain Rice',
        unit: 'kg',
        quantity: 150,
        priceKZT: 450,
        totalKZT: 67500,
      },
    ],
    totalKZT: 67500,
    createdAt: new Date('2024-03-05').toISOString(),
    updatedAt: new Date('2024-03-11').toISOString(),
    archived: false,
  },
  {
    id: 'order-4',
    supplierId: 'supplier-2',
    supplierName: 'Kazakhstan Food Distributors',
    consumerId: 'consumer@scp.kz',
    consumerName: 'Alice Brown',
    status: OrderStatus.COMPLETED,
    items: [
      {
        id: 'item-5',
        productId: '5',
        productName: 'Buckwheat Groats',
        unit: 'kg',
        quantity: 100,
        priceKZT: 380,
        totalKZT: 38000,
      },
      {
        id: 'item-6',
        productId: '6',
        productName: 'Pasta Vermicelli',
        unit: 'kg',
        quantity: 200,
        priceKZT: 290,
        totalKZT: 58000,
      },
    ],
    totalKZT: 96000,
    createdAt: new Date('2024-02-28').toISOString(),
    updatedAt: new Date('2024-03-06').toISOString(),
    archived: false,
  },
  {
    id: 'order-5',
    supplierId: 'supplier-3',
    supplierName: 'Astana Wholesale Co.',
    consumerId: 'consumer@scp.kz',
    consumerName: 'Alice Brown',
    status: OrderStatus.PENDING,
    items: [
      {
        id: 'item-7',
        productId: '8',
        productName: 'Black Tea Leaves',
        unit: 'kg',
        quantity: 20,
        priceKZT: 1200,
        totalKZT: 24000,
      },
      {
        id: 'item-8',
        productId: '9',
        productName: 'Instant Coffee',
        unit: 'kg',
        quantity: 10,
        priceKZT: 2800,
        totalKZT: 28000,
      },
    ],
    totalKZT: 52000,
    createdAt: new Date('2024-03-12').toISOString(),
    updatedAt: new Date('2024-03-12').toISOString(),
    archived: false,
  },
  {
    id: 'order-6',
    supplierId: 'supplier-2',
    supplierName: 'Kazakhstan Food Distributors',
    consumerId: 'consumer@scp.kz',
    consumerName: 'Alice Brown',
    status: OrderStatus.ACCEPTED,
    items: [
      {
        id: 'item-9',
        productId: '10',
        productName: 'Dried Lentils',
        unit: 'kg',
        quantity: 100,
        priceKZT: 420,
        totalKZT: 42000,
      },
    ],
    totalKZT: 42000,
    createdAt: new Date('2024-03-09').toISOString(),
    updatedAt: new Date('2024-03-10').toISOString(),
    archived: false,
  },
  {
    id: 'order-7',
    supplierId: 'supplier-1',
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: 'consumer@scp.kz',
    consumerName: 'Alice Brown',
    status: OrderStatus.CANCELLED,
    items: [
      {
        id: 'item-10',
        productId: '11',
        productName: 'Tomato Paste',
        unit: 'kg',
        quantity: 50,
        priceKZT: 650,
        totalKZT: 32500,
      },
    ],
    totalKZT: 32500,
    createdAt: new Date('2024-03-07').toISOString(),
    updatedAt: new Date('2024-03-08').toISOString(),
    archived: false,
  },
];

async function fetchOrders(): Promise<Order[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('orders');
  return stored ? JSON.parse(stored) : mockOrders;
}

async function createOrder(cart: CartItem[], notes: string, user: User): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('orders');
  const orders = stored ? JSON.parse(stored) : mockOrders;
  
  const items = cart.map((item, index) => ({
    id: `item-${Date.now()}-${index}`,
    productId: item.product.id,
    productName: item.product.name,
    unit: item.product.unit,
    quantity: item.quantity,
    priceKZT: item.product.priceKZT,
    totalKZT: item.product.priceKZT * item.quantity,
  }));
  
  const totalKZT = items.reduce((sum, item) => sum + item.totalKZT, 0);
  
  const newOrder: Order = {
    id: `order-${Date.now()}`,
    supplierId: cart[0].product.supplierId,
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: user.id,
    consumerName: user.name,
    status: OrderStatus.PENDING,
    items,
    totalKZT,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  };
  
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  return newOrder;
}

async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('orders');
  const orders = stored ? JSON.parse(stored) : mockOrders;
  
  const orderIndex = orders.findIndex((o: Order) => o.id === orderId);
  if (orderIndex !== -1) {
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    orders[orderIndex].respondedAt = new Date().toISOString();
    localStorage.setItem('orders', JSON.stringify(orders));
  }
}

export default function OrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('session');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const cartData = JSON.parse(storedCart);
      // Convert cart object to CartItem array
      const cartItems: CartItem[] = [];
      Object.entries(cartData).forEach(([productId, quantity]) => {
        const product = mockProducts.find(p => p.id === productId);
        if (product) {
          cartItems.push({ product, quantity: quantity as number });
        }
      });
      setCart(cartItems);
      setShowCheckout(cartItems.length > 0);
    }
  }, []);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const createOrderMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not authenticated');
      return createOrder(cart, notes, user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCart([]);
      setNotes('');
      setShowCheckout(false);
      // Clear cart from localStorage
      localStorage.removeItem('cart');
      toast({
        title: 'Success',
        description: 'Order created successfully',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Success',
        description: 'Order status updated',
      });
    },
  });

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  const isConsumer = user.role === UserRole.CONSUMER;
  const isSupplier = [UserRole.OWNER, UserRole.ADMIN, UserRole.SALES].includes(user.role);

  const userOrders = orders?.filter((o) =>
    isConsumer 
      ? o.consumerId === user.id || o.consumerId === user.email
      : o.supplierId === user.companyId || o.supplierId === 'supplier-1'
  ) || [];

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      setCart(cart.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + product.moq }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: product.moq }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.product.id !== productId));
    } else {
      setCart(cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.priceKZT * item.quantity,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-2">
            {isConsumer ? 'Create and manage your orders' : 'Manage incoming orders'}
          </p>
        </div>
        {isConsumer && (
          <Button onClick={() => setShowCheckout(!showCheckout)}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {showCheckout ? 'View Orders' : 'New Order'}
          </Button>
        )}
      </div>

      {isConsumer && showCheckout && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Products</CardTitle>
              <CardDescription>Select items to add to your cart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrencyKZT(product.priceKZT)} / {product.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MOQ: {product.moq} {product.unit}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => addToCart(product)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
              <CardDescription>Review and checkout your order</CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrencyKZT(item.product.priceKZT)} × {item.quantity} = {formatCurrencyKZT(item.product.priceKZT * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity - item.product.moq)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-16 text-center">
                          {item.quantity} {item.product.unit}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + item.product.moq)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.product.id, 0)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add delivery instructions or special requests..."
                      />
                    </div>

                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrencyKZT(cartTotal)}</span>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => createOrderMutation.mutate()}
                      disabled={createOrderMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Place Order
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {isConsumer ? 'My Orders' : 'Incoming Orders'} ({userOrders.length})
        </h2>
        <div className="space-y-4">
          {userOrders.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No orders yet
                </p>
              </CardContent>
            </Card>
          )}
          
          {userOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                    <CardDescription>
                      {isConsumer ? `To: ${order.supplierName}` : `From: ${order.consumerName}`}
                      <br />
                      {new Date(order.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      order.status === OrderStatus.PENDING ? 'secondary' :
                      order.status === OrderStatus.ACCEPTED ? 'default' :
                      order.status === OrderStatus.REJECTED ? 'destructive' :
                      'outline'
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.productName} ({item.quantity} {item.unit})
                      </span>
                      <span className="font-medium">
                        {formatCurrencyKZT(item.totalKZT)}
                      </span>
                    </div>
                  ))}
                </div>
                
                {order.notes && (
                  <div className="text-sm">
                    <p className="font-medium">Notes:</p>
                    <p className="text-muted-foreground">{order.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg">
                    {formatCurrencyKZT(order.totalKZT)}
                  </span>
                </div>

                {isSupplier && order.status === OrderStatus.PENDING && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({
                        orderId: order.id,
                        status: OrderStatus.ACCEPTED,
                      })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({
                        orderId: order.id,
                        status: OrderStatus.REJECTED,
                      })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
