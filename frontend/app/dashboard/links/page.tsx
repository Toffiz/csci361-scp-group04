'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, LinkStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Mock data for static export
const mockLinks: Link[] = [
  {
    id: '1',
    supplierId: 'supplier-1',
    supplierName: 'ТОО "Поставщик"',
    consumerId: 'consumer-1',
    consumerName: 'ТОО "Потребитель"',
    status: LinkStatus.PENDING,
    requestedAt: new Date('2024-03-15').toISOString(),
    respondedAt: null,
    archived: false,
  },
  {
    id: '2',
    supplierId: 'supplier-1',
    supplierName: 'ТОО "Поставщик"',
    consumerId: 'consumer-2',
    consumerName: 'ИП "Магазин"',
    status: LinkStatus.APPROVED,
    requestedAt: new Date('2024-03-01').toISOString(),
    respondedAt: new Date('2024-03-02').toISOString(),
    archived: false,
  },
];

async function fetchLinks(): Promise<Link[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('links');
  return stored ? JSON.parse(stored) : mockLinks;
}

async function approveLink(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('links');
  const links = stored ? JSON.parse(stored) : mockLinks;
  const updated = links.map((link: Link) =>
    link.id === id
      ? { ...link, status: LinkStatus.APPROVED, respondedAt: new Date().toISOString() }
      : link
  );
  localStorage.setItem('links', JSON.stringify(updated));
  return { success: true };
}

async function declineLink(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('links');
  const links = stored ? JSON.parse(stored) : mockLinks;
  const updated = links.map((link: Link) =>
    link.id === id
      ? { ...link, status: LinkStatus.DECLINED, respondedAt: new Date().toISOString() }
      : link
  );
  localStorage.setItem('links', JSON.stringify(updated));
  return { success: true };
}

export default function LinksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: links, isLoading } = useQuery({
    queryKey: ['links'],
    queryFn: fetchLinks,
  });

  const approveMutation = useMutation({
    mutationFn: approveLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({
        title: 'Успешно',
        description: 'Связь одобрена',
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: declineLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({
        title: 'Отклонено',
        description: 'Запрос на связь отклонен',
      });
    },
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  const pendingLinks = links?.filter((l) => l.status === LinkStatus.PENDING) || [];
  const activeLinks = links?.filter((l) => l.status === LinkStatus.APPROVED) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Связи</h1>
        <p className="text-muted-foreground mt-2">
          Управление связями с потребителями
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Ожидают одобрения ({pendingLinks.length})
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {pendingLinks.map((link) => (
            <Card key={link.id}>
              <CardHeader>
                <CardTitle className="text-lg">{link.consumerName}</CardTitle>
                <CardDescription>
                  Запрошено {new Date(link.requestedAt).toLocaleDateString('ru-RU')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(link.id)}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Одобрить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => declineMutation.mutate(link.id)}
                    disabled={declineMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Отклонить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {pendingLinks.length === 0 && (
            <Card className="md:col-span-2">
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  Нет ожидающих запросов
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Активные связи ({activeLinks.length})
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {activeLinks.map((link) => (
            <Card key={link.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{link.consumerName}</CardTitle>
                  <Badge variant="default">Активна</Badge>
                </div>
                <CardDescription>
                  С {new Date(link.respondedAt || link.requestedAt).toLocaleDateString('ru-RU')}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
          
          {activeLinks.length === 0 && (
            <Card className="md:col-span-3">
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  Нет активных связей
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
