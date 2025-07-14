"use client";

import Link from "next/link";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import config from "@/config";

/**
 * Login/Signup page for Supabase Auth with enhanced branding
 * Supports OAuth (Google, GitHub) and magic link authentication
 * Redirects to /api/auth/callback for Code Exchange processing
 */
export default function Login() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  /**
   * Handle authentication signup for both OAuth and magic link
   * @param {Event} e - Form submission event
   * @param {Object} options - Authentication options (type, provider)
   */
  const handleSignup = async (e, options) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      const { type, provider } = options;
      const redirectURL = window.location.origin + "/api/auth/callback";

      if (type === "oauth") {
        // OAuth authentication flow
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectURL,
          },
        });
      } else if (type === "magic_link") {
        // Magic link authentication flow
        await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectURL,
          },
        });

        toast.success("Check your emails!");
        setIsDisabled(true);
      }
    } catch (error) {
      console.log("Authentication error:", error);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" data-theme={config.colors.theme}>
            {/* Header with back button */}
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main content container */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-2">
        {/* Logo section */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="w-8 h-8"
              >
                <g transform="translate(16, 16) scale(0.12) translate(-250, -250)">
                  <path
                    d="M 286.0884705 239.6364288 L 286.0884705 293.6871643 L 247.72813420000003 293.6871643 L 216.63769540000004 262.6018677 L 216.63769540000004 276.4438477 L 243.66307080000004 303.4692078 L 243.66307080000004 331.3127747 L 189.61747750000004 331.3127747 L 189.61747750000004 179.2565613 L 249.99736030000003 239.6364289 L 286.0884705 239.6364289 z M 192.8900909 168.6872101 L 251.7983703 227.590332 L 310.3825073 227.590332 L 310.3825073 168.6872101 L 192.8900909 168.6872101 z"
                    fill="#fcf4b4"
                    stroke="none"
                  />
                </g>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Welcome to {config.appName}
          </h1>
          <p className="text-sm text-gray-600 max-w-xs mx-auto mb-4">
            Create stunning professional portfolios with AI-powered automation
          </p>
        </div>

        {/* Authentication form container */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-xl p-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-3">
              Sign in to your account
            </h2>

            <div className="space-y-2">
              {/* Google OAuth Button */}
              <button
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-2 px-3 rounded-lg transition-all duration-200 hover:shadow-md"
                onClick={(e) => handleSignup(e, { type: "oauth", provider: "google" })}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                    />
                    <path
                      fill="#FF3D00"
                      d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                    />
                  </svg>
                )}
                Continue with Google
              </button>

              {/* GitHub OAuth Button */}
              <button
                className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md"
                onClick={(e) => handleSignup(e, { type: "oauth", provider: "github" })}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                )}
                Continue with GitHub
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">or continue with email</span>
                </div>
              </div>

              {/* Magic Link Form */}
              <form
                className="space-y-4"
                onSubmit={(e) => handleSignup(e, { type: "magic_link" })}
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    autoComplete="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isDisabled}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="loading loading-spinner loading-xs"></span>
                      Sending...
                    </span>
                  ) : (
                    "Send Magic Link"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Footer text */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/tos" className="text-blue-600 hover:text-blue-700 font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
