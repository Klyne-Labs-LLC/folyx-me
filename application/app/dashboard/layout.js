import { redirect } from "next/navigation";
import config from "@/config";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import DashboardSidebar from "@/components/DashboardSidebar";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
export default async function LayoutPrivate({ children }) {
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
      <div className="flex">
        <DashboardSidebar user={session.user} profile={displayProfile} />
        <div className="flex-1 lg:pl-0">
          {/* Mobile top spacing */}
          <div className="lg:hidden h-16"></div>
          {children}
        </div>
      </div>
    </div>
  );
}
