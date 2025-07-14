import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import ResumeUploadClient from "./ResumeUploadClient";

export const dynamic = "force-dynamic";

export default async function ResumeUploadPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // Get user's stored resume data if any
  const { data: resumeData } = await supabase
    .from("user_content")
    .select("*")
    .eq("user_id", session?.user?.id)
    .eq("content_type", "resume")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <main>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Resume & CV Upload</h1>
          <p className="text-base-content/80 mt-2">
            Upload your resume or CV to automatically extract professional information for your portfolio
          </p>
        </div>

        <ResumeUploadClient initialResumeData={resumeData} />
      </div>
    </main>
  );
}