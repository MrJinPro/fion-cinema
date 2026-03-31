// TypeScript shims for Supabase Edge Functions.
// These make VS Code's built-in TS server stop erroring on Deno globals and remote imports.
// Runtime is still Deno (Supabase Edge Runtime).

declare namespace Deno {
  const env: {
    get(key: string): string | undefined;
  };
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: unknown,
  ): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string, options?: any): any;
}

declare module "https://esm.sh/@supabase/supabase-js@2.57.4" {
  export function createClient(url: string, key: string, options?: any): any;
}
