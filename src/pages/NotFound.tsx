import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden" dir="rtl">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ top: '-80px', right: '-60px', width: '340px', height: '340px', background: 'rgba(90,68,200,0.20)', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full" style={{ bottom: '-60px', left: '-50px', width: '280px', height: '280px', background: 'rgba(18,108,92,0.14)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center">
          <SearchX className="w-10 h-10 text-primary" />
        </div>
        
        <div>
          <h1 className="text-6xl font-black text-foreground mb-3">۴۰۴</h1>
          <p className="text-lg text-muted-foreground">
            صفحه‌ای که دنبالش بودید پیدا نشد
          </p>
        </div>

        <Button asChild className="mt-4 h-12 px-8 rounded-xl gap-2">
          <Link to="/">
            <Home className="w-5 h-5" />
            بازگشت به خانه
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
