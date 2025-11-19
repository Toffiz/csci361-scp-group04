'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, LinkStatus, User, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Plus, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';

// Mock data for static export
const mockLinks: Link[] = [
  {
    id: '1',
    supplierId: 'supplier-1',
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: 'consumer-1',
    consumerName: 'Consumer Co',
    status: LinkStatus.PENDING,
    requestedAt: new Date('2024-03-15').toISOString(),
    archived: false,
  },
  {
    id: '2',
    supplierId: 'supplier-1',
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: 'consumer-2',
    consumerName: 'Store Inc',
    status: LinkStatus.APPROVED,
    requestedAt: new Date('2024-03-01').toISOString(),
    respondedAt: new Date('2024-03-02').toISOString(),
    archived: false,
  },
];

const mockSuppliers = [
  { id: 'supplier-1', name: 'Almaty Grain Trading LLC' },
  { id: 'supplier-2', name: 'Kazakhstan Food Distributors' },
  { id: 'supplier-3', name: 'Astana Wholesale Co.' },
];

async function fetchLinks(): Promise<Link[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('links');
  return stored ? JSON.parse(stored) : mockLinks;
}

async function sendLinkRequest(supplierName: string, consumerId: string, consumerName: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('links');
  const links = stored ? JSON.parse(stored) : mockLinks;
  
  // Find supplier by name
  const supplier = mockSuppliers.find(s => s.name === supplierName);
  if (!supplier) {
    throw new Error('Supplier not found');
  }
  
  // Check if link already exists
  const exists = links.find((l: Link) => 
    l.supplierId === supplier.id && l.consumerId === consumerId
  );
  
  if (exists) {
    throw new Error('Link request already exists');
  }
  
  const newLink: Link = {
    id: 'link-' + Date.now(),
    supplierId: supplier.id,
    supplierName: supplier.name,
    consumerId,
    consumerName,
    status: LinkStatus.PENDING,
    requestedAt: new Date().toISOString(),
    archived: false,
  };
  
  links.push(newLink);
  localStorage.setItem('links', JSON.stringify(links));
  return { success: true };
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
  const [user, setUser] = useState<User | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  
  useEffect(() => {
    const stored = localStorage.getItem('session');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);
  
  const { data: links, isLoading } = useQuery({
    queryKey: ['links'],
    queryFn: fetchLinks,
  });

  const sendRequestMutation = useMutation({
    mutationFn: (supplierName: string) => {
      if (!user) throw new Error('Not authenticated');
      return sendLinkRequest(supplierName, user.id, user.name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setShowRequestForm(false);
      setSupplierName('');
      toast({
        title: 'Success',
        description: 'Link request sent successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({
        title: 'Success',
        description: 'Link approved',
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: declineLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({
        title: 'Declined',
        description: 'Link request declined',
      });
    },
  });

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  const isConsumer = user.role === UserRole.CONSUMER;
  const isSupplier = [UserRole.OWNER, UserRole.ADMIN, UserRole.SALES].includes(user.role);
  
  const userLinks = links?.filter((l) => 
    isConsumer ? l.consumerId === user.id : l.supplierId === user.companyId
  ) || [];
  
  const pendingLinks = userLinks.filter((l) => l.status === LinkStatus.PENDING);
  const activeLinks = userLinks.filter((l) => l.status === LinkStatus.APPROVED);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Links</h1>
          <p className="text-muted-foreground mt-2">
            {isConsumer ? 'Connect with suppliers' : 'Manage consumer links'}
          </p>
        </div>
        
        {isConsumer && (
          <Button onClick={() => setShowRequestForm(!showRequestForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Link
          </Button>
        )}
      </div>

      {isConsumer && showRequestForm && (
        <Card>
          <CardHeader>
            <CardTitle>Send Link Request</CardTitle>
            <CardDescription>
              Request access to a supplier's catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier Name</Label>
                <select
                  id="supplier"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a supplier...</option>
                  {mockSuppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => sendRequestMutation.mutate(supplierName)}
                  disabled={!supplierName || sendRequestMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRequestForm(false);
                    setSupplierName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isSupplier && pendingLinks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Pending Approval ({pendingLinks.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingLinks.map((link) => (
              <Card key={link.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{link.consumerName}</CardTitle>
                  <CardDescription>
                    Requested on {new Date(link.requestedAt).toLocaleDateString('en-US')}
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
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineMutation.mutate(link.id)}
                      disabled={declineMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {isConsumer ? 'My Connections' : 'Active Links'} ({activeLinks.length})
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {activeLinks.map((link) => (
            <Card key={link.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {isConsumer ? link.supplierName : link.consumerName}
                  </CardTitle>
                  <Badge variant="default">Active</Badge>
                </div>
                <CardDescription>
                  Since {new Date(link.respondedAt || link.requestedAt).toLocaleDateString('en-US')}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
          
          {activeLinks.length === 0 && (
            <Card className="md:col-span-3">
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  {isConsumer ? 'No active connections. Send a link request to get started.' : 'No active links'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isConsumer && pendingLinks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Pending Requests ({pendingLinks.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {pendingLinks.map((link) => (
              <Card key={link.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{link.supplierName}</CardTitle>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <CardDescription>
                    Requested on {new Date(link.requestedAt).toLocaleDateString('en-US')}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
