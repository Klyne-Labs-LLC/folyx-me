import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ResumeExtractor from '@/libs/content-fetchers/modules/ResumeExtractor';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type');
    let extractionResult;

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload (for Word documents)
      const formData = await request.formData();
      const file = formData.get('resume');
      
      if (!file) {
        return NextResponse.json({ 
          error: 'No file provided' 
        }, { status: 400 });
      }

      // Initialize resume extractor
      const extractor = new ResumeExtractor();
      
      // Extract data from resume
      extractionResult = await extractor.extractFromFile(file);
    } else {
      // Handle extracted text (for PDF and TXT files processed client-side)
      const { extractedText, fileName, fileSize } = await request.json();
      
      if (!extractedText) {
        return NextResponse.json({ 
          error: 'No extracted text provided' 
        }, { status: 400 });
      }

      // Initialize resume extractor
      const extractor = new ResumeExtractor();
      
      // Parse the extracted text into structured data
      const structuredData = await extractor.parseResumeText(extractedText);

      extractionResult = {
        success: true,
        originalText: extractedText,
        structuredData,
        metadata: {
          fileName: fileName || 'resume',
          fileSize: fileSize || 0,
          fileType: fileName ? fileName.split('.').pop() : 'unknown',
          extractedAt: new Date().toISOString(),
          extractionMethod: 'client_side'
        }
      };
    }
    
    if (!extractionResult.success) {
      return NextResponse.json({ 
        error: extractionResult.error 
      }, { status: 400 });
    }

    // Store the extracted data in the database
    const { data: storedData, error: storageError } = await supabase
      .from('user_content')
      .upsert({
        user_id: session.user.id,
        content_type: 'resume',
        original_text: extractionResult.originalText,
        structured_data: extractionResult.structuredData,
        metadata: extractionResult.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,content_type'
      })
      .select()
      .single();

    if (storageError) {
      console.error('Error storing resume data:', storageError);
      // Still return the extracted data even if storage fails
    }

    return NextResponse.json({
      success: true,
      data: {
        structuredData: extractionResult.structuredData,
        originalText: extractionResult.originalText,
        metadata: extractionResult.metadata
      },
      stored: !storageError
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ 
      error: 'Failed to parse resume', 
      details: error.message 
    }, { status: 500 });
  }
}