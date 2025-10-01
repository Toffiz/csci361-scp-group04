import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function ComplaintsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Жалобы</h1>
        <p className="text-muted-foreground mt-2">
          Управление жалобами клиентов
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Нет открытых жалоб
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
