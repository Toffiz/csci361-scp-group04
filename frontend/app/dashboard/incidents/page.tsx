'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function IncidentsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('incidents.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('incidents.subtitle')}
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t('incidents.exportCsv')}
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            {t('incidents.noRegisteredIncidents')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
