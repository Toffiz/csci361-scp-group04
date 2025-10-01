import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Администрирование</h1>
        <p className="text-muted-foreground mt-2">
          Управление пользователями и настройками
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Пользователи и роли</CardTitle>
            <CardDescription>
              Управление доступом сотрудников
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Функция в разработке
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Настройки компании</CardTitle>
            <CardDescription>
              Профиль и параметры
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Функция в разработке
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
