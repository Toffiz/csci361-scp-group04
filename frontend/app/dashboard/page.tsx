'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserRole } from '@/types';
import { Package, ShoppingCart, MessageSquare, AlertCircle, Link2 } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <p className="text-muted-foreground mt-2">
          {user.companyName}
        </p>
      </div>

      {user.role === UserRole.CONSUMER && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Links
              </CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Catalog access
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Messages
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Unread
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {(user.role === UserRole.OWNER || user.role === UserRole.ADMIN) && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approval
              </CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Link requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                In catalog
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Need processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Complaints
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Open complaints
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {user.role === UserRole.SALES && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chats
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active dialogs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                In processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Complaints
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Assigned to me
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Main platform features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user.role === UserRole.CONSUMER && (
              <>
                <p className="text-sm text-muted-foreground">
                  • Browse the <a href="/dashboard/catalog" className="text-primary hover:underline">product catalog</a> of linked suppliers
                </p>
                <p className="text-sm text-muted-foreground">
                  • Create orders and track their status in the <a href="/dashboard/orders" className="text-primary hover:underline">Orders</a> section
                </p>
                <p className="text-sm text-muted-foreground">
                  • Communicate with managers in <a href="/dashboard/chat" className="text-primary hover:underline">Chat</a>
                </p>
              </>
            )}
            
            {(user.role === UserRole.OWNER || user.role === UserRole.ADMIN) && (
              <>
                <p className="text-sm text-muted-foreground">
                  • Approve link requests in the <a href="/dashboard/links" className="text-primary hover:underline">Links</a> section
                </p>
                <p className="text-sm text-muted-foreground">
                  • Manage products in the <a href="/dashboard/catalog" className="text-primary hover:underline">Catalog</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  • Process <a href="/dashboard/orders" className="text-primary hover:underline">Orders</a> and <a href="/dashboard/complaints" className="text-primary hover:underline">Complaints</a>
                </p>
              </>
            )}
            
            {user.role === UserRole.SALES && (
              <>
                <p className="text-sm text-muted-foreground">
                  • Process customer <a href="/dashboard/orders" className="text-primary hover:underline">Orders</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  • Communicate with customers in <a href="/dashboard/chat" className="text-primary hover:underline">Chat</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  • Resolve customer <a href="/dashboard/complaints" className="text-primary hover:underline">Complaints</a>
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
