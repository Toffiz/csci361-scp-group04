import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Чат</h1>
        <p className="text-muted-foreground mt-2">
          Общение с партнерами
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Нет активных диалогов
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
