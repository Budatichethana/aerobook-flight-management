import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

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
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: null,
      }),
      signUp: async () => ({
        data: { user: null, session: null },
        error: null,
      }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: async () => ({}),
    from: () => queryBuilder,
    rpc: async () => ({ data: null, error: null }),
  };
}

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient =
      supabaseUrl && supabaseAnonKey
        ? createBrowserClient(supabaseUrl, supabaseAnonKey)
        : (createNoopSupabaseClient() as ReturnType<
            typeof createBrowserClient
          >);
  }

  return browserClient;
}
