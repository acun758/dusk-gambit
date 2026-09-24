import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

/**
 * 瞬时令牌时钟差重试：刚登录后，令牌的签发时间可能比校验方时钟快几秒，
 * 服务端会以「JWT issued at future」拒绝整次调用。该偏差会在几秒内自愈，
 * 且拒绝发生在任何写入之前，因此对这类错误自动重试是安全的。
 */
const TRANSIENT_TOKEN_ERRORS = /issued at future|jwt expired|clock skew/i;

const transientTokenRetry = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await next();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error ?? '');
        if (attempt >= 2 || !TRANSIENT_TOKEN_ERRORS.test(message)) throw error;
        await new Promise((resolve) => globalThis.setTimeout(resolve, attempt === 0 ? 1500 : 4000));
      }
    }
  },
);

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth, transientTokenRetry],
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
