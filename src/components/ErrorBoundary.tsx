import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private isModuleError(): boolean {
    const msg = this.state.error?.message?.toLowerCase() || '';
    return msg.includes('importing a module') || 
           msg.includes('failed to fetch dynamically') ||
           msg.includes('loading chunk') ||
           msg.includes('loading css chunk');
  }

  private isNetworkError(): boolean {
    const msg = this.state.error?.message?.toLowerCase() || '';
    return msg.includes('network') || msg.includes('fetch') || !navigator.onLine;
  }

  private handleReload = () => {
    // Clear SW cache before reloading
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    sessionStorage.removeItem('module-reload');
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState(prev => ({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  private getErrorContent() {
    if (this.isModuleError()) {
      return {
        icon: <WifiOff className="w-10 h-10 text-warning" />,
        iconBg: 'bg-warning/10',
        title: 'مشکل در بارگذاری',
        description: 'ممکن است نسخه جدیدی از برنامه منتشر شده باشد یا اتصال اینترنت دچار مشکل شود.',
        primaryAction: 'بارگذاری مجدد',
        primaryHandler: this.handleReload,
      };
    }
    if (this.isNetworkError()) {
      return {
        icon: <WifiOff className="w-10 h-10 text-info" />,
        iconBg: 'bg-info/10',
        title: 'اتصال اینترنت قطع است',
        description: 'لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.',
        primaryAction: 'تلاش مجدد',
        primaryHandler: this.handleRetry,
      };
    }
    return {
      icon: <AlertTriangle className="w-10 h-10 text-destructive" />,
      iconBg: 'bg-destructive/10',
      title: 'خطایی رخ داد',
      description: 'متأسفانه مشکلی در برنامه پیش آمد. لطفاً دوباره تلاش کنید.',
      primaryAction: 'تلاش مجدد',
      primaryHandler: this.handleRetry,
    };
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const content = this.getErrorContent();

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background" dir="rtl">
          <Card className="glass max-w-md w-full">
            <CardHeader className="text-center pb-4">
              <div className={`mx-auto mb-4 p-4 rounded-full w-fit ${content.iconBg}`}>
                {content.icon}
              </div>
              <CardTitle className="text-xl">{content.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground text-sm leading-relaxed">
                {content.description}
              </p>

              <div className="flex flex-col gap-2">
                <Button onClick={content.primaryHandler} className="w-full rounded-xl h-12">
                  <RefreshCw className="w-4 h-4 ml-2" />
                  {content.primaryAction}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="w-full rounded-xl"
                >
                  <Home className="w-4 h-4 ml-2" />
                  بازگشت به خانه
                </Button>
                {!this.isModuleError() && (
                  <Button 
                    variant="ghost" 
                    onClick={this.handleReload}
                    className="w-full rounded-xl text-muted-foreground"
                  >
                    بارگذاری مجدد صفحه
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
