import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import PortfolioTemplate from "./PortfolioTemplate";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("title, description, seo_title, seo_description")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!portfolio) {
    return {
      title: "Portfolio Not Found",
      description: "The requested portfolio could not be found."
    };
  }

  return {
    title: portfolio.seo_title || portfolio.title || "Portfolio",
    description: portfolio.seo_description || portfolio.description || "Professional portfolio",
    openGraph: {
      title: portfolio.title,
      description: portfolio.description,
      type: "website",
    },
  };
}

export default async function PortfolioPage({ params }) {
  const supabase = createServerComponentClient({ cookies });
  
  // Get portfolio with projects and owner info
  const { data: portfolio, error } = await supabase
    .from("portfolios")
    .select(`
      *,
      portfolio_projects(*),
      profiles(full_name, avatar_url)
    `)
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (error || !portfolio) {
    notFound();
  }

  // Increment view count
  await supabase
    .from("portfolios")
    .update({ view_count: (portfolio.view_count || 0) + 1 })
    .eq("id", portfolio.id);

  return <PortfolioTemplate portfolio={portfolio} />;
}