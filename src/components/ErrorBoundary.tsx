import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
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
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Track error for analytics
    if (typeof window !== 'undefined' && (window as any).trackError) {
      (window as any).trackError({
        type: 'error_boundary',
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background" dir="rtl">
          <Card className="glass max-w-md w-full">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 rounded-full bg-destructive/10 w-fit">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              <CardTitle className="text-xl">خطایی رخ داد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground text-sm">
                متأسفانه مشکلی در برنامه پیش آمد. لطفاً دوباره تلاش کنید.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 rounded-xl bg-muted/50 text-xs font-mono overflow-auto max-h-32">
                  <p className="text-destructive font-semibold mb-1">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-muted-foreground whitespace-pre-wrap">
                      {this.state.error.stack.split('\n').slice(1, 4).join('\n')}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full rounded-xl">
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تلاش مجدد
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="w-full rounded-xl"
                >
                  <Home className="w-4 h-4 ml-2" />
                  بازگشت به خانه
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={this.handleReload}
                  className="w-full rounded-xl text-muted-foreground"
                >
                  بارگذاری مجدد صفحه
                </Button>
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
