
'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, MoreHorizontal, UserX, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/lib/types';
import { format } from 'date-fns';

const placeholderUsers: (UserProfile & { lastLogin: Date, status: 'active' | 'blocked' })[] = [
    { uid: 'user1', email: 'sanjana.p@email.com', displayName: 'Sanjana Patil', role: 'user', lastLogin: new Date('2023-10-28T10:00:00Z'), status: 'active' },
    { uid: 'user2', email: 'vikram.g@email.com', displayName: 'Vikram Gowda', role: 'user', lastLogin: new Date('2023-10-27T15:30:00Z'), status: 'active' },
    { uid: 'user3', email: 'deepa.r@email.com', displayName: 'Deepa Rao', role: 'user', lastLogin: new Date('2023-10-25T11:00:00Z'), status: 'blocked' },
    { uid: 'admin1', email: 'rajashekar2002@gmail.com', displayName: 'Rajashekar', role: 'admin', lastLogin: new Date('2023-10-28T12:00:00Z'), status: 'active' },
];

type UserAction = 'block' | 'delete';

export default function ManageUsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionType, setActionType] = useState<UserAction | null>(null);
  const { toast } = useToast();

  const handleActionClick = (user: UserProfile, action: UserAction) => {
    setSelectedUser(user);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleActionConfirm = () => {
    if (!selectedUser || !actionType) return;
    
    // In a real app, you would make an API call to perform the action.
    toast({
      title: `User ${actionType === 'block' ? 'Blocked' : 'Deleted'}`,
      description: `The user "${selectedUser.displayName}" has been ${actionType === 'block' ? 'blocked' : 'deleted'}.`,
    });
    console.log(`${actionType} user:`, selectedUser.uid);

    setDialogOpen(false);
    setSelectedUser(null);
    setActionType(null);
  };

  const getDialogContent = () => {
    if (!selectedUser || !actionType) return { title: '', description: '' };
    if (actionType === 'block') {
      return {
        title: `Block ${selectedUser.displayName}?`,
        description: 'This will prevent the user from logging in. Are you sure?',
      };
    }
    return {
      title: `Delete ${selectedUser.displayName}?`,
      description: `This action cannot be undone. This will permanently delete the user account.`,
    };
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Users</h1>
          <p className="text-muted-foreground">View and manage user accounts.</p>
        </div>
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search users by name or email..." className="pl-8" />
                  </div>
                </div>
            </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placeholderUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.photoURL} alt={user.displayName || ''} />
                                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-0.5">
                                <span className="font-semibold">{user.displayName}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                     <TableCell>
                      <Badge variant={user.status === 'active' ? 'secondary' : 'default'} className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(user.lastLogin, 'PP pp')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.role === 'admin'}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleActionClick(user, 'block')} className="text-orange-600 focus:bg-orange-50 focus:text-orange-700">
                            <UserX className="mr-2 h-4 w-4" />
                            Block User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleActionClick(user, 'delete')} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getDialogContent().title}</AlertDialogTitle>
            <AlertDialogDescription>{getDialogContent().description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActionConfirm}
              className={buttonVariants({ variant: actionType === 'delete' ? 'destructive' : 'default' })}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
