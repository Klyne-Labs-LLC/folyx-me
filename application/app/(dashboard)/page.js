import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import config from "@/config";
import ProfileEnsurer from "@/components/ProfileEnsurer";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session?.user?.id)
    .single();

  // Get portfolio count
  const { count: portfolioCount } = await supabase
    .from("portfolios")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", session?.user?.id);

  // Get published portfolio count
  const { count: publishedCount } = await supabase
    .from("portfolios")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", session?.user?.id)
    .eq("is_published", true);

  // If no profile exists, create a default one for display
  const displayProfile = profile || {
    id: session?.user?.id,
    email: session?.user?.email,
    full_name: session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || null,
    avatar_url: session?.user?.user_metadata?.avatar_url || null,
    has_access: config.payments.freeAccessMode || false,
    plan_type: 'free'
  };

  const userName = displayProfile?.full_name || session?.user?.email?.split('@')[0] || 'User';
  
  return (
    <main className="max-h-screen overflow-hidden">
      <ProfileEnsurer hasProfile={!!profile} />
      
      {/* Compact Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}!</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            displayProfile?.has_access ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {displayProfile?.plan_type || 'Free'} Plan
          </span>
          {!config.payments.enabled && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              🎉 Free Access Period
            </span>
          )}
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {/* Left Column - Stats & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Portfolio Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Portfolio Overview</h2>
              <Link 
                href="/portfolios/new" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Portfolio
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{portfolioCount || 0}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{publishedCount || 0}</div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                href="/portfolios" 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Manage Portfolios</p>
                  <p className="text-xs text-gray-500">View and edit your portfolios</p>
                </div>
              </Link>
              
              <Link 
                href="/integrations" 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Connect Platforms</p>
                  <p className="text-xs text-gray-500">Link GitHub, LinkedIn & more</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Getting Started */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">1</div>
                <span className="ml-3 text-sm text-gray-700">Connect your accounts</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-300 text-white text-xs font-bold rounded-full flex items-center justify-center">2</div>
                <span className="ml-3 text-sm text-gray-500">Create your first portfolio</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-300 text-white text-xs font-bold rounded-full flex items-center justify-center">3</div>
                <span className="ml-3 text-sm text-gray-500">Publish and share</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-200">
              <Link 
                href="/integrations" 
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Start connecting accounts
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Recent Activity - Placeholder for future feature */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
