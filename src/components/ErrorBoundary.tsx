import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-surface-container-low">
          <div className="max-w-md w-full bg-surface-container-lowest p-8 md:p-12 rounded-3xl shadow-2xl text-center border border-outline-variant/10">
            <div className="w-20 h-20 bg-error-container text-error rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-error/10">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-4 tracking-tight">Something went wrong</h1>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              We encountered an unexpected error. Our team has been notified and we're working to fix it.
            </p>
            
            {this.state.error && (
              <div className="bg-surface-container-low p-4 rounded-xl text-left mb-8 overflow-hidden">
                <p className="text-xs font-mono text-error font-bold uppercase tracking-widest mb-2">Error Details</p>
                <p className="text-xs font-mono text-on-surface-variant break-all line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-on-primary-fixed-variant text-white rounded-xl font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95"
              >
                <RefreshCcw className="w-5 h-5" />
                Try Again
              </button>
              <Link 
                to="/"
                onClick={() => this.setState({ hasError: false })}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-surface-container-low text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
