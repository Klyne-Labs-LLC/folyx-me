import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/portfolios - Get user's portfolios
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: portfolios, error } = await supabase
      .from("portfolios")
      .select(`
        *,
        portfolio_projects(count)
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching portfolios:", error);
      return NextResponse.json({ error: "Failed to fetch portfolios" }, { status: 500 });
    }

    return NextResponse.json({ portfolios });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/portfolios - Create new portfolio
export async function POST(req) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, template_id = "modern" } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate unique slug
    const { data: slugData } = await supabase
      .rpc('generate_unique_slug', { 
        input_title: title, 
        user_id: session.user.id 
      });

    const portfolioData = {
      user_id: session.user.id,
      title,
      description: description || "",
      slug: slugData,
      template_id,
      template_config: {},
      content_data: {},
      is_published: false
    };

    const { data: portfolio, error } = await supabase
      .from("portfolios")
      .insert([portfolioData])
      .select()
      .single();

    if (error) {
      console.error("Error creating portfolio:", error);
      return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 });
    }

    return NextResponse.json({ portfolio }, { status: 201 });
  } catch (error) {
    console.error("Portfolio creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}