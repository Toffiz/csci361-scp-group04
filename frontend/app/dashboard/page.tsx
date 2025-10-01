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
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Добро пожаловать, {user.name}</h1>
        <p className="text-muted-foreground mt-2">
          {user.companyName}
        </p>
      </div>

      {user.role === UserRole.CONSUMER && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Активные связи
              </CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Доступ к каталогу
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Мои заказы
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Активных заказов
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Сообщения
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Непрочитанных
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
                Ожидают одобрения
              </CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Запросов на связь
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Товары
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                В каталоге
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Заказы
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Требуют обработки
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Жалобы
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Открытых жалоб
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
                Чаты
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Активных диалогов
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Заказы
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                На обработке
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Жалобы
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Назначено мне
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Быстрый старт</CardTitle>
          <CardDescription>
            Основные функции платформы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user.role === UserRole.CONSUMER && (
              <>
                <p className="text-sm text-muted-foreground">
                  • Просмотрите <a href="/catalog" className="text-primary hover:underline">каталог товаров</a> связанных поставщиков
                </p>
                <p className="text-sm text-muted-foreground">
                  • Создавайте заказы и отслеживайте их статус в разделе <a href="/orders" className="text-primary hover:underline">Заказы</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  • Общайтесь с менеджерами в <a href="/chat" className="text-primary hover:underline">Чате</a>
                </p>
              </>
            )}
            
            {(user.role === UserRole.OWNER || user.role === UserRole.ADMIN) && (
              <>
                <p className="text-sm text-muted-foreground">
                  • Одобряйте запросы на связь в разделе <a href="/links" className="text-primary hover:underline">Связи</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  • Управляйте товарами в <a href="/catalog" className="text-primary hover:underline">Каталоге</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  • Обрабатывайте <a href="/orders" className="text-primary hover:underline">Заказы</a> и <a href="/complaints" className="text-primary hover:underline">Жалобы</a>
                </p>
              </>
            )}
            
            {user.role === UserRole.SALES && (
              <>
                <p className="text-sm text-muted-foreground">
                  • Обрабатывайте <a href="/orders" className="text-primary hover:underline">Заказы</a> от клиентов
                </p>
                <p className="text-sm text-muted-foreground">
                  • Общайтесь с клиентами в <a href="/chat" className="text-primary hover:underline">Чате</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  • Решайте <a href="/complaints" className="text-primary hover:underline">Жалобы</a> клиентов
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
