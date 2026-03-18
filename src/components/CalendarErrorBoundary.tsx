import { Component, ReactNode } from 'react';
import { SimpleCalendar } from './SimpleCalendar';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  useSimpleCalendar: boolean;
}

export class CalendarErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, useSimpleCalendar: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      useSimpleCalendar: false
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Calendar Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col bg-white">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              {!this.state.useSimpleCalendar ? (
                <>
                  <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Calendar Loading Error
                  </h3>
                  <p className="text-gray-600 mb-6">
                    The advanced calendar couldn't load properly. You can try refreshing or use the simple view.
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center gap-2 bg-[#406780] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#355a6d] transition-colors"
                    >
                      <RefreshCw size={16} />
                      Refresh Page
                    </button>
                    
                    <div className="text-gray-400 text-sm">or</div>
                    
                    <button
                      onClick={() => this.setState({ useSimpleCalendar: true, hasError: false })}
                      className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Use Simple Calendar
                    </button>
                  </div>
                </>
              ) : (
                <SimpleCalendar />
              )}
            </div>
          </div>
        </div>
      );
    }

    if (this.state.useSimpleCalendar) {
      return <SimpleCalendar />;
    }

    return this.props.children;
  }
}