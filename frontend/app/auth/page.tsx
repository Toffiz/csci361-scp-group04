'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { UserRole, User } from '@/types';

// Mock users for role selection
const mockUsers: Record<UserRole, User> = {
  [UserRole.OWNER]: {
    id: 'owner-1',
    name: 'Владелец Поставщик',
    email: 'owner@supplier.kz',
    role: UserRole.OWNER,
    companyId: 'supplier-1',
    companyName: 'ТОО "Поставщик"',
    active: true,
  },
  [UserRole.ADMIN]: {
    id: 'admin-1',
    name: 'Администратор Поставщик',
    email: 'admin@supplier.kz',
    role: UserRole.ADMIN,
    companyId: 'supplier-1',
    companyName: 'ТОО "Поставщик"',
    active: true,
  },
  [UserRole.SALES]: {
    id: 'sales-1',
    name: 'Менеджер Продаж',
    email: 'sales@supplier.kz',
    role: UserRole.SALES,
    companyId: 'supplier-1',
    companyName: 'ТОО "Поставщик"',
    active: true,
  },
  [UserRole.CONSUMER]: {
    id: 'consumer-1',
    name: 'Ресторан "Астана"',
    email: 'contact@restaurant.kz',
    role: UserRole.CONSUMER,
    companyId: 'consumer-1',
    companyName: 'Ресторан "Астана"',
    active: true,
  },
};

export default function AuthPage() {
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    const user = mockUsers[role];
    if (user) {
      localStorage.setItem('session', JSON.stringify(user));
      router.push('/dashboard');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Добро пожаловать</CardTitle>
          <CardDescription>
            Выберите роль для входа в систему
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={() => handleRoleSelect(UserRole.OWNER)}
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-start"
            >
              <span className="font-semibold text-lg">Владелец</span>
              <span className="text-sm text-muted-foreground">
                Полный доступ к управлению поставщиком
              </span>
            </Button>
            
            <Button
              onClick={() => handleRoleSelect(UserRole.ADMIN)}
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-start"
            >
              <span className="font-semibold text-lg">Администратор</span>
              <span className="text-sm text-muted-foreground">
                Управление связями и жалобами
              </span>
            </Button>
            
            <Button
              onClick={() => handleRoleSelect(UserRole.SALES)}
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-start"
            >
              <span className="font-semibold text-lg">Менеджер по продажам</span>
              <span className="text-sm text-muted-foreground">
                Работа с заказами и чатами
              </span>
            </Button>
            
            <Button
              onClick={() => handleRoleSelect(UserRole.CONSUMER)}
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-start"
            >
              <span className="font-semibold text-lg">Потребитель</span>
              <span className="text-sm text-muted-foreground">
                Доступ к каталогу и заказам
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
