import { Component, ReactNode } from "react";

export class AuthErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-white p-8">
          <p className="text-slate-600 text-center">Session expirée. Veuillez vous reconnecter.</p>
          <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl"
            onClick={() => window.location.reload()}
          >
            Recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
