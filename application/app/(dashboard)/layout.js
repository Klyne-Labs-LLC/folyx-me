import { redirect } from "next/navigation";
import config from "@/config";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import DashboardSidebar from "@/components/DashboardSidebar";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of the dashboard
export default async function DashboardLayout({ children }) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  // Get user profile data for sidebar
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session?.user?.id)
    .single();

  // Create display profile with fallbacks
  const displayProfile = profile || {
    id: session?.user?.id,
    email: session?.user?.email,
    full_name: session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || null,
    avatar_url: session?.user?.user_metadata?.avatar_url || null,
    has_access: config.payments.freeAccessMode || false,
    plan_type: 'free'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar user={session.user} profile={displayProfile} />
      
      {/* Content area with proper centering */}
      <div className="lg:ml-64 min-h-screen">
        {/* Mobile top spacing */}
        <div className="lg:hidden h-16"></div>
        
        {/* Center content in the remaining viewport space */}
        <div className="flex justify-center min-h-full">
          <div className="w-full max-w-6xl px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}