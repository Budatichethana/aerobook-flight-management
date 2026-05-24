import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function createNoopQueryBuilder() {
  const state: Record<string, unknown> = { data: [], error: null };

  const builder = new Proxy(state as Record<string, unknown>, {
    get(target, property) {
      if (property === "then") {
        return (resolve: (value: { data: unknown[]; error: null }) => void) => {
          resolve({ data: [], error: null });
        };
      }

      if (property === "catch" || property === "finally") {
        return undefined;
      }

      if (typeof property === "string" && property in target) {
        return target[property];
      }

      return (..._args: unknown[]) => builder;
    },
  });

  return builder;
}

function createNoopSupabaseClient() {
  const queryBuilder = createNoopQueryBuilder();

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => queryBuilder,
    rpc: async () => ({ data: null, error: null }),
  };
}

export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : (createNoopSupabaseClient() as unknown as ReturnType<
        typeof createClient
      >);

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  if (!supabaseUrl || !supabaseAnonKey) {
    return createNoopSupabaseClient() as unknown as ReturnType<
      typeof createServerClient
    >;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server components cannot always write cookies.
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        } catch {
          // Server components cannot always write cookies.
        }
      },
    },
  });
}
