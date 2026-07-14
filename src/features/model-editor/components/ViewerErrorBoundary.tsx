"use client";

import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";

type ViewerErrorBoundaryProps = {
  children: ReactNode;
  resetKey: string;
  onError: (error: Error) => void;
};

type ViewerErrorBoundaryState = {
  hasError: boolean;
};

export class ViewerErrorBoundary extends Component<
  ViewerErrorBoundaryProps,
  ViewerErrorBoundaryState
> {
  state: ViewerErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ViewerErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(
    error: Error,
    errorInfo: ErrorInfo,
  ): void {
    console.error(
      "Failed to render 3D model:",
      error,
      errorInfo,
    );

    this.props.onError(error);
  }

  componentDidUpdate(
    previousProps: ViewerErrorBoundaryProps,
  ): void {
    if (
      this.state.hasError &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({
        hasError: false,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}