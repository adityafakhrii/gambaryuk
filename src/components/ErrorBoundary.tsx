import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const lang = (() => {
        try { return localStorage.getItem('language') || 'id'; } catch { return 'id'; }
      })();
      const isId = lang === 'id';

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-10 w-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {isId ? 'Terjadi Kesalahan' : 'Something Went Wrong'}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isId
                  ? 'Aplikasi mengalami error yang tidak terduga. Silakan muat ulang halaman atau kembali ke beranda.'
                  : 'The application encountered an unexpected error. Please reload the page or go back to the homepage.'}
              </p>
            </div>

            {this.state.error && (
              <div className="rounded-xl border border-border bg-muted/50 p-4 text-left">
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                {isId ? 'Muat Ulang' : 'Reload Page'}
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Home className="h-4 w-4" />
                {isId ? 'Ke Beranda' : 'Go Home'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
