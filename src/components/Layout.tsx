import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Stethoscope, LogOut, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, userRole, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-full p-2">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">OralVis</h1>
              <p className="text-sm text-muted-foreground">Healthcare Scan Management</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.email}</span>
                {userRole && (
                  <Badge variant="secondary" className="capitalize">
                    {userRole}
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}