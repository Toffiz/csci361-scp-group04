'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserRole, Link, Order, Thread } from '@/types';
import { Package, ShoppingCart, MessageSquare, AlertCircle, Link2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function DashboardPage() {
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    activeLinks: 0,
    activeOrders: 0,
    unreadMessages: 0,
    pendingLinks: 0,
    totalProducts: 0,
    totalOrders: 0,
    openComplaints: 0,
  });

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (session) {
      const userData = JSON.parse(session);
      setUser(userData);
      
      // Calculate real stats from localStorage
      const links: Link[] = JSON.parse(localStorage.getItem('links') || '[]');
      const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
      const threads: Thread[] = JSON.parse(localStorage.getItem('chatThreads') || '[]');
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
      
      if (userData.role === UserRole.CONSUMER) {
        const userLinks = links.filter(l => 
          l.consumerId === userData.id || l.consumerId === userData.email
        );
        const activeLinks = userLinks.filter(l => l.status === 'approved').length;
        
        const userOrders = orders.filter(o => 
          o.consumerId === userData.id || o.consumerId === userData.email
        );
        const activeOrders = userOrders.filter(o => 
          o.status === 'pending' || o.status === 'accepted'
        ).length;
        
        const userThreads = threads.filter(t => 
          t.consumerId === userData.id || t.consumerId === userData.email
        );
        const unreadMessages = userThreads.reduce((sum, t) => sum + t.unreadCount, 0);
        
        setStats({
          activeLinks,
          activeOrders,
          unreadMessages,
          pendingLinks: 0,
          totalProducts: 0,
          totalOrders: 0,
          openComplaints: 0,
        });
      } else {
        // Supplier stats
        const supplierLinks = links.filter(l => 
          l.supplierId === userData.companyId || l.supplierId === 'supplier-1'
        );
        const pendingLinks = supplierLinks.filter(l => l.status === 'pending').length;
        
        const supplierProducts = products.filter((p: any) => 
          p.supplierId === userData.companyId || p.supplierId === 'supplier-1'
        );
        const totalProducts = supplierProducts.filter((p: any) => !p.archived).length;
        
        const supplierOrders = orders.filter(o => 
          o.supplierId === userData.companyId || o.supplierId === 'supplier-1'
        );
        const totalOrders = supplierOrders.length;
        
        const openComplaints = complaints.filter((c: any) => 
          c.status === 'open' || c.status === 'in_progress'
        ).length;
        
        setStats({
          activeLinks: 0,
          activeOrders: 0,
          unreadMessages: 0,
          pendingLinks,
          totalProducts,
          totalOrders,
          openComplaints,
        });
      }
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.welcome')}, {user.name}</h1>
        <p className="text-muted-foreground mt-2">
          {user.companyName}
        </p>
      </div>

      {user.role === UserRole.CONSUMER && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.activeLinks')}
              </CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLinks}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.catalogAccess')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.myOrders')}
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.activeOrders')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.messages')}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.unread')}
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
                {t('dashboard.pendingApproval')}
              </CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingLinks}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.linkRequests')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.products')}
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.inCatalog')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.orders')}
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.totalOrders')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.complaints')}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openComplaints}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.openIssues')}
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
                {t('dashboard.chats')}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.activeDialogs')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.orders')}
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.processing')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.complaints')}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.assignedToMe')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.quickStart')}</CardTitle>
          <CardDescription>
            {t('dashboard.features')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user.role === UserRole.CONSUMER && (
              <>
                <p className="text-sm text-muted-foreground">
                  • {t('dashboard.quickStartConsumer1')}
                </p>
                <p className="text-sm text-muted-foreground">
                  • {t('dashboard.quickStartConsumer2')}
                </p>
                <p className="text-sm text-muted-foreground">
                  • {t('dashboard.quickStartConsumer3')}
                </p>
              </>
            )}
            
            {(user.role === UserRole.OWNER || user.role === UserRole.ADMIN) && (
              <>
                <p className="text-sm text-muted-foreground">
                  • {t('dashboard.quickStartSupplier1')}
                </p>
                <p className="text-sm text-muted-foreground">
                  • {t('dashboard.quickStartSupplier2')}
                </p>
                <p className="text-sm text-muted-foreground">
                  • {t('dashboard.quickStartSupplier3')}
                </p>
              </>
            )}
            
            {user.role === UserRole.SALES && (
              <>
                <p className="text-sm text-muted-foreground">
                  • {t('dashboard.quickStartSales1')}
                </p>
                <p className="text-sm text-muted-foreground">
                  • {t('dashboard.quickStartSales2')}
                </p>
                <p className="text-sm text-muted-foreground">
                  • {t('dashboard.quickStartSales3')}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
