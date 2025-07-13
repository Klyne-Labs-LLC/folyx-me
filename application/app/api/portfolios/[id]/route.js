import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/portfolios/[id] - Get single portfolio
export async function GET(req, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    // For published portfolios, allow public access
    let query = supabase
      .from("portfolios")
      .select(`
        *,
        portfolio_projects(*),
        profiles(full_name, avatar_url, email)
      `)
      .eq("id", params.id);

    // If user is authenticated and owns the portfolio, show even if unpublished
    if (session) {
      query = query.or(`user_id.eq.${session.user.id},is_published.eq.true`);
    } else {
      query = query.eq("is_published", true);
    }

    const { data: portfolio, error } = await query.single();

    if (error || !portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    // Increment view count (only for public views)
    if (!session || session.user.id !== portfolio.user_id) {
      await supabase
        .from("portfolios")
        .update({ view_count: (portfolio.view_count || 0) + 1 })
        .eq("id", params.id);

      // Track analytics
      await supabase
        .from("portfolio_analytics")
        .insert({
          portfolio_id: params.id,
          event_type: "view",
          user_agent: req.headers.get("user-agent"),
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip")
        });
    }

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/portfolios/[id] - Update portfolio
export async function PUT(req, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();
    
    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.user_id;
    delete updates.slug; // Slug is immutable after creation
    delete updates.view_count;
    delete updates.created_at;

    const { data: portfolio, error } = await supabase
      .from("portfolios")
      .update(updates)
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating portfolio:", error);
      return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 });
    }

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error("Portfolio update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/portfolios/[id] - Delete portfolio
export async function DELETE(req, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("portfolios")
      .delete()
      .eq("id", params.id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error deleting portfolio:", error);
      return NextResponse.json({ error: "Failed to delete portfolio" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Portfolio deletion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}