'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, X } from 'lucide-react';
import { Complaint, ComplaintStatus, CreateComplaintDto, User, UserRole } from '@/types';
import { formatDate } from '@/lib/date';
import { useI18n } from '@/lib/i18n-context';

const mockComplaints: Complaint[] = [
  {
    id: 'complaint-1',
    orderId: 'order-1',
    threadId: 'thread-1',
    reportedBy: 'consumer@scp.kz',
    reporterName: 'Alice Brown',
    subject: 'Delayed Delivery',
    description: 'Order was supposed to arrive on March 15th but still hasn\'t been delivered. Please help resolve this issue.',
    status: ComplaintStatus.OPEN,
    escalated: false,
    createdAt: new Date('2024-03-16').toISOString(),
    updatedAt: new Date('2024-03-16').toISOString(),
    archived: false,
  },
  {
    id: 'complaint-2',
    orderId: 'order-1',
    threadId: 'thread-2',
    reportedBy: 'consumer@scp.kz',
    reporterName: 'Alice Brown',
    subject: 'Quality Issue',
    description: 'The wheat flour received has moisture content higher than specified. This affects our production quality.',
    status: ComplaintStatus.IN_PROGRESS,
    assignedTo: 'sales@scp.kz',
    assignedToName: 'Bob Johnson',
    escalated: false,
    createdAt: new Date('2024-03-12').toISOString(),
    updatedAt: new Date('2024-03-13').toISOString(),
    archived: false,
  },
];

async function fetchComplaints(): Promise<Complaint[]> {
  const stored = localStorage.getItem('complaints');
  return stored ? JSON.parse(stored) : mockComplaints;
}

async function createComplaint(data: CreateComplaintDto & { reportedBy: string; reporterName: string }): Promise<Complaint> {
  const stored = localStorage.getItem('complaints');
  const complaints = stored ? JSON.parse(stored) : mockComplaints;
  
  const newComplaint: Complaint = {
    id: 'complaint-' + Date.now(),
    orderId: data.orderId,
    threadId: 'thread-' + Date.now(),
    reportedBy: data.reportedBy,
    reporterName: data.reporterName,
    subject: data.subject,
    description: data.description,
    status: ComplaintStatus.OPEN,
    escalated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  };
  
  const updated = [...complaints, newComplaint];
  localStorage.setItem('complaints', JSON.stringify(updated));
  return newComplaint;
}

async function updateComplaintStatus(id: string, status: ComplaintStatus): Promise<void> {
  const stored = localStorage.getItem('complaints');
  const complaints = stored ? JSON.parse(stored) : mockComplaints;
  
  const updated = complaints.map((c: Complaint) =>
    c.id === id
      ? { ...c, status, updatedAt: new Date().toISOString() }
      : c
  );
  
  localStorage.setItem('complaints', JSON.stringify(updated));
}

export default function ComplaintsPage() {
  const { t } = useI18n();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  
  const queryClient = useQueryClient();

  const sessionStr = typeof window !== 'undefined' ? localStorage.getItem('session') : null;
  const user: User | null = sessionStr ? JSON.parse(sessionStr) : null;

  const { data: complaints, isLoading } = useQuery<Complaint[]>({
    queryKey: ['complaints'],
    queryFn: fetchComplaints,
  });

  const createMutation = useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setShowCreateForm(false);
      setOrderId('');
      setSubject('');
      setDescription('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ComplaintStatus }) =>
      updateComplaintStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    createMutation.mutate({
      orderId,
      subject,
      description,
      reportedBy: user.email,
      reporterName: user.name,
    });
  };

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  const isConsumer = user.role === UserRole.CONSUMER;
  const isSupplier = [UserRole.OWNER, UserRole.ADMIN, UserRole.SALES].includes(user.role);

  const userComplaints = complaints?.filter((c) =>
    isConsumer 
      ? c.reportedBy === user.id || c.reportedBy === user.email
      : true // Suppliers see all complaints
  ) || [];

  const openComplaints = userComplaints.filter((c) => 
    c.status === ComplaintStatus.OPEN || c.status === ComplaintStatus.IN_PROGRESS
  );
  const resolvedComplaints = userComplaints.filter((c) => 
    c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED
  );

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.OPEN:
        return 'bg-red-100 text-red-800 border-red-300';
      case ComplaintStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case ComplaintStatus.RESOLVED:
        return 'bg-green-100 text-green-800 border-green-300';
      case ComplaintStatus.ESCALATED:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case ComplaintStatus.CLOSED:
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('complaints.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {isConsumer 
              ? t('complaints.subtitleConsumer')
              : t('complaints.subtitleSupplier')}
          </p>
        </div>
        {isConsumer && (
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showCreateForm ? t('complaints.cancel') : t('complaints.reportIssue')}
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && isConsumer && (
        <Card>
          <CardHeader>
            <CardTitle>{t('complaints.reportComplaint')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">{t('complaints.orderId')}</Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g., order-1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">{t('complaints.subject')}</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('complaints.briefDescription')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('complaints.description')}</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('complaints.detailedDescription')}
                  required
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? t('complaints.submitting') : t('complaints.submitComplaint')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Open Complaints */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('complaints.openIssues')} ({openComplaints.length})</h2>
        {openComplaints.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {t('complaints.noOpenComplaints')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {openComplaints.map((complaint) => (
              <Card key={complaint.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{complaint.subject}</h3>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Order: <span className="font-mono">{complaint.orderId}</span>
                      </p>
                      <p className="text-sm mb-2">{complaint.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Reported by: {complaint.reporterName}</span>
                        <span>Created: {formatDate(complaint.createdAt)}</span>
                      </div>
                      {complaint.assignedToName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned to: {complaint.assignedToName}
                        </p>
                      )}
                    </div>
                    {isSupplier && (
                      <div className="flex gap-2">
                        {complaint.status === ComplaintStatus.OPEN && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({
                              id: complaint.id,
                              status: ComplaintStatus.IN_PROGRESS,
                            })}
                          >
                            Start Working
                          </Button>
                        )}
                        {complaint.status === ComplaintStatus.IN_PROGRESS && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({
                              id: complaint.id,
                              status: ComplaintStatus.RESOLVED,
                            })}
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Complaints */}
      {resolvedComplaints.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Resolved Issues ({resolvedComplaints.length})</h2>
          <div className="grid gap-4">
            {resolvedComplaints.map((complaint) => (
              <Card key={complaint.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{complaint.subject}</h3>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Order: <span className="font-mono">{complaint.orderId}</span>
                      </p>
                      <p className="text-sm mb-2">{complaint.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Reported: {formatDate(complaint.createdAt)}</span>
                        <span>Resolved: {formatDate(complaint.updatedAt)}</span>
                      </div>
                    </div>
                    {isSupplier && complaint.status === ComplaintStatus.RESOLVED && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({
                          id: complaint.id,
                          status: ComplaintStatus.CLOSED,
                        })}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
