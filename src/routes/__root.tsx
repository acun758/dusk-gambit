import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SovereignNav } from "../components/SovereignNav";
import { GameEntrance } from "../components/GameEntrance";
import { LangProvider } from "../lib/i18n";
import { ProfileProvider } from "../lib/profile";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { installEngineHost } from "../lib/engine-host";
import { THEME_BACKGROUNDS } from "../lib/theme-background-assets";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, viewport-fit=cover",
      },
      { property: "og:site_name", content: "玄弈 · DUSK GAMBIT" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // 字体已自托管在 /fonts，不再请求任何外部字体服务
      { rel: "preload", as: "font", type: "font/woff2", href: "/fonts/sans400.woff2", crossOrigin: "anonymous" },
      { rel: "preload", as: "font", type: "font/woff2", href: "/fonts/serif700.woff2", crossOrigin: "anonymous" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html className="dark" lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body className="bg-surface text-on-surface min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [showEntrance, setShowEntrance] = useState(true);
  const enterGame = useCallback(() => {
    try {
      window.sessionStorage.setItem("bs.entrance.seen", "1");
    } catch {
      /* storage unavailable */
    }
    setShowEntrance(false);
  }, []);

  // 引擎宿主接入（把浏览器 Worker 注入 core/engine；core 本身不认识浏览器）
  useEffect(() => {
    installEngineHost();
  }, []);

  useEffect(() => {
    const warmThemeCache = () => {
      const width = window.innerWidth;
      const source = width >= 600
        ? window.matchMedia("(orientation: landscape)").matches
          ? "desktop"
          : "ipad"
        : "iphone";
      Object.values(THEME_BACKGROUNDS).forEach((artwork) => {
        const image = new Image();
        image.decoding = "async";
        image.src = artwork[source];
      });
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warmThemeCache, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = globalThis.setTimeout(warmThemeCache, 500);
    return () => globalThis.clearTimeout(id);
  }, []);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem("bs.entrance.seen") === "1") setShowEntrance(false);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <ProfileProvider>
          <div className="home-glass-scope">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <div className="app-shell">
              <Outlet />
            </div>
            {!showEntrance && <SovereignNav />}
            {showEntrance && <GameEntrance onEntered={enterGame} />}
          </div>
        </ProfileProvider>
      </LangProvider>
    </QueryClientProvider>
  );
}

