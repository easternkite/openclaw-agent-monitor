import type { ReactNode } from "react";

type AppShellProps = {
  header: ReactNode;
  connectionBanner?: ReactNode;
  main: ReactNode;
  side: ReactNode;
  errorBoundary?: ReactNode;
};

export function AppShell({ header, connectionBanner, main, side, errorBoundary }: AppShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 md:px-6 lg:px-8">
        <header className="rounded-xl border border-border bg-surface p-4 shadow-sm">{header}</header>

        {connectionBanner ? <section>{connectionBanner}</section> : null}

        {errorBoundary ? <section>{errorBoundary}</section> : null}

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">{main}</div>
          <aside className="rounded-xl border border-border bg-surface p-4 shadow-sm">{side}</aside>
        </section>
      </div>
    </main>
  );
}
