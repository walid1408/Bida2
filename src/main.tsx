import React, { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col items-center justify-center p-6 text-center dir-rtl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 text-2xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold mb-2 text-slate-100">حدث خطأ في تحميل التطبيق</h1>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            حدث خطأ غير متوقع أو عدم توافق في البيانات المحفوظة. اضغط على الزر أدناه لإعادة تشغيل التطبيق وتصفير التخزين المؤقت.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            إعادة تحميل التطبيق (Réinitialiser)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

