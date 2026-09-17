import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import snapshot from "@/data/fide-standard.json";

/**
 * FIDE 月度榜单同步：把仓库内的快照幂等写入 fide_ratings。
 * 客户端永远不直连 fide.com；快照由 scripts/import-fide.ts 离线生成。
 */
export const Route = createFileRoute("/api/public/cron/fide-sync")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const rows = (snapshot as { rows: Record<string, unknown>[] }).rows ?? [];
        let written = 0;
        for (let i = 0; i < rows.length; i += 200) {
          const chunk = rows.slice(i, i + 200).map((r) => ({ ...r, updated_at: new Date().toISOString() }));
          const { error } = await supabaseAdmin.from("fide_ratings").upsert(chunk as never, { onConflict: "fide_id" });
          if (error) return new Response(`sync failed: ${error.message}`, { status: 500 });
          written += chunk.length;
        }
        return Response.json({ ok: true, written, source: (snapshot as { generatedAt?: string }).generatedAt ?? null });
      },
    },
  },
});
