import { Component } from 'react';
import { Button } from '@components';
import { cn } from '@utils';
import i18n from '@/i18n';

export default class ErrorBoundary extends Component<BaseProps> {
  state: { error: Error | null };

  constructor(props: BaseProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, stack: { componentStack: string }) {
    console.error(error);
    console.error(stack);
  }

  render() {
    const { className } = this.props;
    const { error } = this.state;

    if (error) {
      return (
        <div className={cn('w-screen max-w-full h-screen flex-center text-center', className)}>
          <div className="space-y-4">
            <h3 className="text-20 font-600">{i18n.ts('Something went wrong!')}</h3>
            <div className="text-16 text-warn">{error.message}</div>

            {process.env.mode !== 'prod' && (
              <code className="max-h-100 space-y-4 overflow-auto block max-w-full px-4 text-secondary text-14 whitespace-pre-wrap break-all text-left">
                {error.stack}
              </code>
            )}

            <div className="sticky bottom-4 space-x-4">
              <Button size="lg" onClick={() => this.setState({ error: null })}>
                {i18n.ts('Retry')}
              </Button>
              <Button size="lg" onClick={() => window.location.reload()}>
                {i18n.ts('Reload')}
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
