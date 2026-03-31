import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL) throw new Error("SUPABASE_URL not configured");
    if (!SUPABASE_ANON_KEY) throw new Error("SUPABASE_ANON_KEY not configured");
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, { status: 401 });
    }

    // Identify current user (JWT is verified by Supabase gateway when verify_jwt=true)
    const supabaseAsUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabaseAsUser.auth.getUser();
    if (userError || !userData?.user) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role via RLS-protected table
    const { data: adminRow, error: roleError } = await supabaseAsUser
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      return jsonResponse({ error: roleError.message }, { status: 500 });
    }

    if (!adminRow) {
      return jsonResponse({ error: "Forbidden" }, { status: 403 });
    }

    // Admin-only operations with service role
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: listed, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });

    if (listError) {
      return jsonResponse({ error: listError.message }, { status: 500 });
    }

    const users = listed?.users ?? [];
    const userIds = users.map((u: { id: string }) => u.id);

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, created_at")
      .in("id", userIds);

    if (profilesError) {
      return jsonResponse({ error: profilesError.message }, { status: 500 });
    }

    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", userIds);

    if (rolesError) {
      return jsonResponse({ error: rolesError.message }, { status: 500 });
    }

    const profileById = new Map((profiles ?? []).map((p: { id: string }) => [p.id, p]));

    const rolesByUserId = new Map<string, string>();
    for (const row of roles ?? []) {
      const current = rolesByUserId.get(row.user_id);
      const role = row.role as string;
      // pick highest privilege
      const weight = role === "admin" ? 3 : role === "moderator" ? 2 : 1;
      const currentWeight = current === "admin" ? 3 : current === "moderator" ? 2 : current ? 1 : 0;
      if (weight > currentWeight) rolesByUserId.set(row.user_id, role);
    }

    const result = users.map((u: { id: string; email?: string | null; created_at?: string | null }) => {
      const profile = profileById.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        display_name: (profile as any)?.display_name ?? "",
        role: rolesByUserId.get(u.id) ?? "user",
        created_at: (profile as any)?.created_at ?? u.created_at,
      };
    });

    return jsonResponse({ users: result });
  } catch (error) {
    console.error("Error in admin-list-users:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
});
