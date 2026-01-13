import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Here you would typically log to a service like Sentry or LogRocket
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-slate-200 p-6 text-center" 
          role="alert"
          aria-live="assertive"
        >
          {/* Visual Indicator */}
          <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-2xl shadow-rose-900/20 animate-in zoom-in duration-300">
            <AlertTriangle className="w-12 h-12 text-rose-500" aria-hidden="true" />
          </div>

          {/* Bilingual Heading */}
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Something went wrong</h1>
          <h2 className="text-xl font-bold text-rose-400 mb-6 font-tajawal" dir="rtl">حدث خطأ غير متوقع في النظام</h2>
          
          <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
            We apologize for the inconvenience. Please try reloading the page.
            <br />
            نعتذر عن الإزعاج. يرجى محاولة إعادة تحميل الصفحة.
          </p>

          {/* Technical Details (Helpful for support screenshots) */}
          <div className="max-w-lg w-full bg-slate-950/50 p-4 rounded-xl border border-white/10 mb-8 font-mono text-xs text-rose-300/70 text-left overflow-auto max-h-32 select-all">
            {this.state.error?.message || "Unknown Error"}
          </div>

          {/* Recovery Action */}
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 active:scale-95"
            aria-label="Reload Page"
          >
            <RefreshCw size={20} aria-hidden="true" />
            <span>Reload / إعادة تحميل</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}