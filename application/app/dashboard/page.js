import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import ButtonAccount from "@/components/ButtonAccount";
import ButtonCheckout from "@/components/ButtonCheckout";
import config from "@/config";
import ProfileEnsurer from "@/components/ProfileEnsurer";
export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
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

  // If no profile exists, create a default one for display
  const displayProfile = profile || {
    id: session?.user?.id,
    email: session?.user?.email,
    full_name: session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || null,
    avatar_url: session?.user?.user_metadata?.avatar_url || null,
    has_access: config.payments.freeAccessMode || false,
    plan_type: 'free',
    created_at: session?.user?.created_at || new Date().toISOString(),
    updated_at: session?.user?.updated_at || new Date().toISOString()
  };

  // const currentPlan = config.stripe.plans.find(plan => plan.priceId === displayProfile?.price_id);
  
  return (
    <main className="min-h-screen p-8 pb-24 bg-gray-50">
      {/* Ensure profile exists if missing */}
      <ProfileEnsurer hasProfile={!!profile} />
      
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
            <p className="text-base-content/80 mt-2">Welcome back, {displayProfile?.full_name || session?.user?.email?.split('@')[0]}!</p>
          </div>
          <ButtonAccount />
        </div>

        {/* User Profile Card */}
        <div className="card bg-white shadow-lg border border-gray-200">
          <div className="card-body">
            <h2 className="card-title text-gray-900">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-70">Email</p>
                <p className="font-medium">{displayProfile?.email}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Plan</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium capitalize">{displayProfile?.plan_type || 'Free'}</p>
                  {displayProfile?.has_access && (
                    <div className="badge badge-success badge-sm">Active</div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm opacity-70">Member Since</p>
                <p className="font-medium">
                  {displayProfile?.created_at ? 
                    new Date(displayProfile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 
                    'Just now'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm opacity-70">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`badge badge-sm ${displayProfile?.has_access ? 'badge-success' : 'badge-warning'}`}>
                    {displayProfile?.has_access ? 'Premium' : 'Free User'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status - Only show if payments are enabled */}
        {config.payments.enabled && !displayProfile?.has_access && (
          <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="card-body">
              <h2 className="card-title text-gray-900">Unlock Folyx Pro Features</h2>
              <p className="text-base-content/80 mb-4">
                Create unlimited AI-powered portfolios with advanced integrations and analytics.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.stripe.plans.map((plan) => (
                  <div key={plan.priceId} className="card bg-base-100 shadow">
                    <div className="card-body">
                      <h3 className="card-title text-lg">{plan.name}</h3>
                      <p className="text-sm opacity-70 mb-2">{plan.description}</p>
                      <div className="text-2xl font-bold mb-2">
                        ${plan.price}
                        <span className="text-sm font-normal opacity-70">/month</span>
                      </div>
                      <ul className="text-sm space-y-1 mb-4">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {feature.name}
                          </li>
                        ))}
                      </ul>
                      <ButtonCheckout 
                        priceId={plan.priceId} 
                        mode="subscription"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Free Access Notice - Show when payments are disabled */}
        {!config.payments.enabled && (
          <div className="card bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
            <div className="card-body">
              <h2 className="card-title text-gray-900">🎉 Free Access Period</h2>
              <p className="text-base-content/80">
                You currently have full access to all Folyx features at no cost! 
                This includes unlimited AI-powered portfolio generation, all templates, 
                and premium integrations.
              </p>
              <div className="mt-4">
                <div className="badge badge-success badge-lg">All Features Unlocked</div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Section */}
        <div className="card bg-white shadow-lg border border-gray-200">
          <div className="card-body">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title text-gray-900">Your Portfolios</h2>
              <a href="/dashboard/portfolios/new" className="btn btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Portfolio
              </a>
            </div>
            
            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="stat bg-base-100 rounded-lg p-4">
                <div className="stat-title text-sm opacity-70">Total Portfolios</div>
                <div className="stat-value text-2xl">0</div>
                <div className="stat-desc text-success">Ready to create your first!</div>
              </div>
              <div className="stat bg-base-100 rounded-lg p-4">
                <div className="stat-title text-sm opacity-70">Published</div>
                <div className="stat-value text-2xl">0</div>
                <div className="stat-desc">Live portfolios</div>
              </div>
              <div className="stat bg-base-100 rounded-lg p-4">
                <div className="stat-title text-sm opacity-70">Total Views</div>
                <div className="stat-value text-2xl">0</div>
                <div className="stat-desc">Visitor count</div>
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">🚀 Quick Start Guide</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span>Connect your GitHub account</span>
                  <a href="/dashboard/integrations" className="btn btn-sm btn-outline">Connect</a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span>Create your first portfolio</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span>AI generates content from your projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <span>Publish and share your portfolio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
