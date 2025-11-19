'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, UserPlus, Trash2 } from 'lucide-react';
import { User, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  active: boolean;
}

const mockCompanyUsers: CompanyUser[] = [
  {
    id: 'owner@scp.kz',
    name: 'John Doe',
    email: 'owner@scp.kz',
    role: UserRole.OWNER,
    companyId: 'company-1',
    active: true,
  },
  {
    id: 'admin@scp.kz',
    name: 'Jane Smith',
    email: 'admin@scp.kz',
    role: UserRole.ADMIN,
    companyId: 'company-1',
    active: true,
  },
  {
    id: 'sales@scp.kz',
    name: 'Bob Johnson',
    email: 'sales@scp.kz',
    role: UserRole.SALES,
    companyId: 'company-1',
    active: true,
  },
];

async function fetchCompanyUsers(companyId: string): Promise<CompanyUser[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const allUsers = localStorage.getItem('users');
  if (!allUsers) return mockCompanyUsers;
  
  const users = JSON.parse(allUsers);
  return users
    .filter((u: any) => u.email.includes('scp.kz') && u.role !== UserRole.CONSUMER)
    .map((u: any) => ({
      id: u.email,
      name: u.name,
      email: u.email,
      role: u.role,
      companyId: 'company-1',
      active: true,
    }));
}

async function addUser(userData: { name: string; email: string; role: UserRole; password: string }) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('users');
  const users = stored ? JSON.parse(stored) : [];
  
  if (users.find((u: any) => u.email === userData.email)) {
    throw new Error('Email already exists');
  }
  
  users.push({
    ...userData,
    companyName: 'SCP Corp',
  });
  
  localStorage.setItem('users', JSON.stringify(users));
  return { success: true };
}

async function removeUser(email: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('users');
  const users = stored ? JSON.parse(stored) : [];
  
  const filtered = users.filter((u: any) => u.email !== email);
  localStorage.setItem('users', JSON.stringify(filtered));
  return { success: true };
}

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: UserRole.SALES,
    password: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('session');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const { data: companyUsers, isLoading } = useQuery({
    queryKey: ['companyUsers', user?.companyId],
    queryFn: () => user ? fetchCompanyUsers(user.companyId) : Promise.resolve([]),
    enabled: !!user,
  });

  const addUserMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyUsers'] });
      setShowAddUser(false);
      setNewUser({ name: '', email: '', role: UserRole.SALES, password: '' });
      toast({
        title: 'Success',
        description: 'User added successfully',
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

  const removeUserMutation = useMutation({
    mutationFn: removeUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyUsers'] });
      toast({
        title: 'Success',
        description: 'User removed successfully',
      });
    },
  });

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  const canManageUsers = user.role === UserRole.OWNER || user.role === UserRole.ADMIN;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground mt-2">
            Manage company users and settings
          </p>
        </div>
        {canManageUsers && (
          <Button onClick={() => setShowAddUser(!showAddUser)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {showAddUser && canManageUsers && (
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>
              Add a manager or sales person to your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@scp.kz"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value={UserRole.ADMIN}>Manager (Admin)</option>
                    <option value={UserRole.SALES}>Sales Person</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => addUserMutation.mutate(newUser)}
                  disabled={
                    !newUser.name ||
                    !newUser.email ||
                    !newUser.password ||
                    newUser.password.length < 6 ||
                    addUserMutation.isPending
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddUser(false);
                    setNewUser({ name: '', email: '', role: UserRole.SALES, password: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {companyUsers?.length || 0} users in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyUsers?.map((companyUser) => (
                <div
                  key={companyUser.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{companyUser.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {companyUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        companyUser.role === UserRole.OWNER ? 'default' :
                        companyUser.role === UserRole.ADMIN ? 'secondary' :
                        'outline'
                      }
                    >
                      {companyUser.role === UserRole.OWNER ? 'Owner' :
                       companyUser.role === UserRole.ADMIN ? 'Manager' :
                       'Sales'}
                    </Badge>
                    {canManageUsers && companyUser.role !== UserRole.OWNER && companyUser.id !== user.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeUserMutation.mutate(companyUser.email)}
                        disabled={removeUserMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {(!companyUsers || companyUsers.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No team members found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Settings</CardTitle>
            <CardDescription>
              Manage your company profile and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={user.companyName} disabled />
              </div>
              <div className="space-y-2">
                <Label>Company ID</Label>
                <Input value={user.companyId} disabled />
              </div>
              <p className="text-sm text-muted-foreground">
                Contact support to update company information
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
