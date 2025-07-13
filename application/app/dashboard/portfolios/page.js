import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PortfoliosPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user's portfolios
  const { data: portfolios, error } = await supabase
    .from("portfolios")
    .select(`
      *,
      portfolio_projects!left (
        id,
        title,
        is_featured
      )
    `)
    .eq("user_id", session?.user?.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching portfolios:", error);
  }

  const portfolioList = portfolios || [];

  return (
    <main>
      <section className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">My Portfolios</h1>
            <p className="text-base-content/80 mt-2">
              Manage and showcase your AI-generated portfolios
            </p>
          </div>
          <Link 
            href="/dashboard/portfolios/new" 
            className="btn btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Portfolio
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card bg-white shadow-lg border border-gray-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Portfolios</p>
                  <p className="text-2xl font-bold text-gray-900">{portfolioList.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-lg border border-gray-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolioList.filter(p => p.is_published).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-lg border border-gray-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolioList.reduce((sum, p) => sum + (p.view_count || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-lg border border-gray-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolioList.reduce((sum, p) => sum + (p.portfolio_projects?.length || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolios Grid */}
        {portfolioList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioList.map((portfolio) => (
              <div key={portfolio.id} className="card bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="card-title text-lg font-semibold text-gray-900 line-clamp-2">
                      {portfolio.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {portfolio.is_published ? (
                        <div className="badge badge-success badge-sm">Published</div>
                      ) : (
                        <div className="badge badge-warning badge-sm">Draft</div>
                      )}
                    </div>
                  </div>
                  
                  {portfolio.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {portfolio.description}
                    </p>
                  )}

                  {/* Portfolio Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Projects:</span>
                      <span className="ml-2 font-medium">{portfolio.portfolio_projects?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Views:</span>
                      <span className="ml-2 font-medium">{portfolio.view_count || 0}</span>
                    </div>
                  </div>

                  {/* Template Badge */}
                  <div className="mb-4">
                    <span className="badge badge-outline badge-sm">
                      {portfolio.template_id || 'modern'} template
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link 
                      href={`/dashboard/portfolios/${portfolio.id}`}
                      className="btn btn-outline btn-sm flex-1"
                    >
                      Manage
                    </Link>
                    {portfolio.is_published && (
                      <a 
                        href={`https://${portfolio.subdomain}.folyx.me`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm flex-1"
                      >
                        View Live
                      </a>
                    )}
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs text-gray-500 mt-3">
                    Updated {new Date(portfolio.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="card bg-white shadow-lg border border-gray-200">
            <div className="card-body text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No portfolios yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first AI-powered portfolio to showcase your projects and skills to the world.
              </p>
              
              <div className="space-y-4">
                <Link 
                  href="/dashboard/portfolios/new" 
                  className="btn btn-primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Portfolio
                </Link>
                
                <div className="text-sm text-gray-500">
                  or <Link href="/dashboard/integrations" className="link link-primary">connect your platforms first</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {portfolioList.length > 0 && (
          <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  href="/dashboard/portfolios/new" 
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Create New Portfolio</p>
                    <p className="text-sm text-gray-600">Build another showcase</p>
                  </div>
                </Link>

                <Link 
                  href="/dashboard/integrations" 
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sync Platforms</p>
                    <p className="text-sm text-gray-600">Update your data</p>
                  </div>
                </Link>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg opacity-60">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Analytics</p>
                    <p className="text-sm text-gray-600">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}