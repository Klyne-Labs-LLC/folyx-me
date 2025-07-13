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
    has_access: false,
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

        {/* Subscription Status */}
        {!displayProfile?.has_access && (
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

        {/* Portfolio Section - Coming Soon */}
        <div className="card bg-white shadow-lg border border-gray-200">
          <div className="card-body">
            <h2 className="card-title text-gray-900">Your Portfolios</h2>
            <div className="text-center py-12">
              <div className="text-6xl opacity-30 mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Portfolio Builder Coming Soon</h3>
              <p className="text-base-content/70">
                We&apos;re building the most advanced AI-powered portfolio generator. 
                Stay tuned for the launch!
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
