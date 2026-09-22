"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type Props = { children: ReactNode; onReset?: () => void };
type State = { error: Error | null };

export class SandboxErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="border border-[var(--line)] bg-[var(--bg-elevated)] p-6">
          <p className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.16em] text-[var(--danger)]">
            Workspace error
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            The in-browser editor failed to load. This is often fixed by resetting or refreshing.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="line"
              onClick={() => {
                this.setState({ error: null });
                this.props.onReset?.();
              }}
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
