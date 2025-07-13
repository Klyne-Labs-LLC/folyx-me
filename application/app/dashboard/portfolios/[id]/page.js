import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PortfolioManagerClient from "./PortfolioManagerClient";

export const dynamic = "force-dynamic";

export default async function PortfolioManagerPage({ params }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/signin");
  }

  // Get portfolio with projects
  const { data: portfolio, error } = await supabase
    .from("portfolios")
    .select(`
      *,
      portfolio_projects(*)
    `)
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single();

  if (error || !portfolio) {
    notFound();
  }

  // Get user's connected platforms
  const { data: connections } = await supabase
    .from("connected_platforms")
    .select("*")
    .eq("user_id", session.user.id);

  return (
    <main>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">{portfolio.title}</h1>
            <p className="text-base-content/80 mt-2">
              Manage your portfolio content and settings
            </p>
          </div>
          <div className="flex gap-2">
            {portfolio.is_published && (
              <a
                href={`https://${portfolio.subdomain}.folyx.me`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Live
              </a>
            )}
            <Link href="/dashboard/portfolios" className="btn btn-ghost">
              ← Back to Portfolios
            </Link>
          </div>
        </div>

        <PortfolioManagerClient 
          portfolio={portfolio} 
          connections={connections || []}
        />
      </div>
    </main>
  );
}