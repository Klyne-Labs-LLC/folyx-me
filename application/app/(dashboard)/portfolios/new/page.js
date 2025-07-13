import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import PortfolioCreateClient from "./PortfolioCreateClient";

export const dynamic = "force-dynamic";

export default async function NewPortfolioPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/signin");
  }

  // Get user's connected platforms to show available data sources
  const { data: connections } = await supabase
    .from("connected_platforms")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("sync_status", "completed");

  return (
    <main>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Create New Portfolio</h1>
          <p className="text-base-content/80 mt-2">
            Set up your portfolio and let AI generate content from your connected platforms
          </p>
        </div>

        <PortfolioCreateClient connections={connections || []} />
      </div>
    </main>
  );
}