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
      await logout();
      // toast({
      //   title: 'Success',
      //   description: 'You have been logged out',
      // });
      router.push('/login');
      // Reset logout state after a short delay to ensure navigation completes
      setTimeout(() => {
        try {
          // This will be handled by the login page loading
        } catch (err) {}
      }, 100);
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
      className="h-8 px-3 text-xs border-slate-300"
    >
      Logout
    </Button>
  );
}
