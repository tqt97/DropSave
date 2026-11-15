import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unexpected UI error', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="fatal-state">
          <div>
            <span className="eyebrow">DropSave</span>
            <h1>Ứng dụng gặp sự cố.</h1>
            <p>Hãy đóng và mở lại ứng dụng. Không có tệp đang tải nào bị ghi đè tự động.</p>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
