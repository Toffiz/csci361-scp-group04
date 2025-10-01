import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download } from 'lucide-react';

export default function IncidentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Инциденты</h1>
          <p className="text-muted-foreground mt-2">
            Системные инциденты и события
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Экспорт CSV
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Нет зарегистрированных инцидентов
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
