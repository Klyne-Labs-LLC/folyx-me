import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { subdomain } = await request.json();

    // Validate subdomain format
    if (!subdomain || typeof subdomain !== 'string') {
      return NextResponse.json(
        { error: "Subdomain is required" },
        { status: 400 }
      );
    }

    // Clean and validate subdomain
    const cleanSubdomain = subdomain.toLowerCase().trim();
    
    // Check subdomain format (alphanumeric, hyphens, 3-63 characters)
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
    if (!subdomainRegex.test(cleanSubdomain)) {
      return NextResponse.json(
        { 
          error: "Invalid subdomain format. Use only letters, numbers, and hyphens (3-63 characters).",
          available: false 
        },
        { status: 400 }
      );
    }

    // Check for reserved subdomains
    const reservedSubdomains = [
      'www', 'app', 'api', 'admin', 'dashboard', 'mail', 'ftp', 'blog', 
      'support', 'help', 'status', 'dev', 'staging', 'test', 'demo',
      'portfolio', 'portfolios', 'folyx', 'cdn', 'assets', 'static'
    ];

    if (reservedSubdomains.includes(cleanSubdomain)) {
      return NextResponse.json(
        { 
          error: "This subdomain is reserved and cannot be used.",
          available: false 
        },
        { status: 400 }
      );
    }

    // Check if subdomain is already taken
    const { data: existingPortfolio } = await supabase
      .from("portfolios")
      .select("id, user_id")
      .eq("subdomain", cleanSubdomain)
      .single();

    if (existingPortfolio) {
      return NextResponse.json(
        { 
          error: "This subdomain is already taken.",
          available: false 
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      available: true,
      subdomain: cleanSubdomain,
      message: "Subdomain is available!"
    });

  } catch (error) {
    console.error("Check subdomain error:", error);
    return NextResponse.json(
      { error: "Failed to check subdomain availability" },
      { status: 500 }
    );
  }
}