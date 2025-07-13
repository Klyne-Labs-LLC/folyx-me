import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import IntegrationsClient from "./IntegrationsClient";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // Get user's connected platforms
  const { data: connections } = await supabase
    .from("connected_platforms")
    .select("*")
    .eq("user_id", session?.user?.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-8 pb-24 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Platform Integrations</h1>
          <p className="text-base-content/80 mt-2">
            Connect your accounts to automatically generate portfolio content
          </p>
        </div>

        <IntegrationsClient initialConnections={connections || []} />
      </div>
    </main>
  );
}