import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

type RouteErrorBoundaryProps = {
  children: ReactNode;
  resetKey: string;
};

type RouteErrorBoundaryState = {
  hasError: boolean;
};

export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: RouteErrorBoundaryProps) {
    if (
      this.state.hasError &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route render failed", {
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="document-page route-error-page" role="alert">
        <div className="document-header">
          <p className="eyebrow">Раздел не открылся</p>
          <h1>Покажем безопасный маршрут назад</h1>
          <p>
            В этом месте интерфейс споткнулся, но Атлас остается доступен.
            Вернитесь к основной шкале или откройте карту разделов.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary button-md" to="/">
            Вернуться в атлас
          </Link>
          <Link className="button button-secondary button-md" to="/materials">
            Открыть материалы
          </Link>
        </div>
      </section>
    );
  }
}
