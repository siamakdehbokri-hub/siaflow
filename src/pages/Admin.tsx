import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminPanel } from '@/components/AdminPanel';
import { Loader2, Shield, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, user, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient blobs for glassmorphic depth */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute rounded-full"
          style={{ top: '-80px', right: '-60px', width: '340px', height: '340px', background: 'rgba(90,68,200,0.24)', filter: 'blur(80px)' }}
        />
        <div
          className="absolute rounded-full"
          style={{ bottom: '-60px', left: '-50px', width: '280px', height: '280px', background: 'rgba(18,108,92,0.18)', filter: 'blur(80px)' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10" style={{ background: 'linear-gradient(135deg, var(--header-from), var(--header-to))' }}>
        <div className="pt-safe" />
        <div className="h-14 px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-10 w-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-white/80" />
            <h1 className="text-lg font-bold text-white">پنل مدیریت</h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>
      
      {/* Content */}
      <main className="relative z-10 pb-8">
        <div className="max-w-lg mx-auto px-4 py-4">
          <AdminPanel />
        </div>
      </main>
    </div>
  );
}
