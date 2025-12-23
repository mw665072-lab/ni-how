'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useAppContext();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      logout();
      toast({
        title: 'Success',
        description: 'You have been logged out',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
    >
      Logout
    </Button>
  );
}
