"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/libs/api";
import toast from "react-hot-toast";
import Script from "next/script";

const SUPPORTED_FORMATS = ['pdf', 'docx', 'doc', 'txt'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const FileIcon = () => (
  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export default function ResumeUploadClient({ initialResumeData }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(initialResumeData?.structured_data || null);
  const [originalText, setOriginalText] = useState(initialResumeData?.original_text || '');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  // Load PDF.js library
  useEffect(() => {
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      setPdfLoaded(true);
      // Set PDF.js worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }, []);

  const handlePdfJsLoad = () => {
    setPdfLoaded(true);
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  };

  const validateFile = (file) => {
    if (!file) return { isValid: false, error: 'No file selected' };

    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!SUPPORTED_FORMATS.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: `Unsupported file format. Supported: ${SUPPORTED_FORMATS.join(', ')}` 
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` 
      };
    }

    return { isValid: true };
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validation = validateFile(selectedFile);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setFile(selectedFile);
  };

  // Extract text from PDF client-side
  const extractTextFromPDF = async (file) => {
    if (!window.pdfjsLib) {
      throw new Error('PDF.js not loaded');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  };

  // Extract text from text file
  const extractTextFromFile = async (file) => {
    return await file.text();
  };

  const uploadAndExtract = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      let extractedText = '';
      const fileExtension = file.name.toLowerCase().split('.').pop();

      // Extract text based on file type
      if (fileExtension === 'pdf') {
        if (!pdfLoaded) {
          throw new Error('PDF extraction library not loaded. Please try again.');
        }
        extractedText = await extractTextFromPDF(file);
      } else if (fileExtension === 'txt') {
        extractedText = await extractTextFromFile(file);
      } else if (fileExtension === 'docx' || fileExtension === 'doc') {
        // For Word documents, we'll still use server-side processing
        const formData = new FormData();
        formData.append('resume', file);

        const response = await apiClient.post('/content-fetchers/parse-resume', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.success) {
          setExtractedData(response.data.structuredData);
          setOriginalText(response.data.originalText);
          toast.success('Resume processed successfully!');
          
          // Reset file selection
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          throw new Error(response.error || 'Failed to process resume');
        }
        return;
      }

      // Send extracted text to server for parsing
      const response = await apiClient.post('/content-fetchers/parse-resume', {
        extractedText: extractedText,
        fileName: file.name,
        fileSize: file.size
      });

      if (response.success) {
        setExtractedData(response.data.structuredData);
        setOriginalText(response.data.originalText);
        toast.success('Resume processed successfully!');
        
        // Reset file selection
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(response.error || 'Failed to process resume');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      toast.error(error.message || 'Failed to process resume');
    } finally {
      setUploading(false);
    }
  };

  const handleEditSection = (section, data) => {
    setEditingSection({ section, data });
    setShowEditForm(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPersonalInfo = () => {
    if (!extractedData?.personalInfo) return null;

    const info = extractedData.personalInfo;
    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <button
              onClick={() => handleEditSection('personalInfo', info)}
              className="btn btn-ghost btn-sm"
            >
              <EditIcon />
              Edit
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {info.name && (
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{info.name}</p>
              </div>
            )}
            {info.email && (
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{info.email}</p>
              </div>
            )}
            {info.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{info.phone}</p>
              </div>
            )}
            {info.location && (
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900">{info.location}</p>
              </div>
            )}
            {info.linkedin && (
              <div>
                <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                <p className="text-gray-900 truncate">{info.linkedin}</p>
              </div>
            )}
            {info.github && (
              <div>
                <label className="text-sm font-medium text-gray-500">GitHub</label>
                <p className="text-gray-900 truncate">{info.github}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!extractedData?.experience || extractedData.experience.length === 0) return null;

    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Work Experience</h3>
            <button
              onClick={() => handleEditSection('experience', extractedData.experience)}
              className="btn btn-ghost btn-sm"
            >
              <EditIcon />
              Edit
            </button>
          </div>
          
          <div className="space-y-4 mt-4">
            {extractedData.experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4">
                <h4 className="font-medium text-gray-900">{exp.title}</h4>
                {exp.company && <p className="text-gray-600">{exp.company}</p>}
                {exp.duration && <p className="text-sm text-gray-500">{exp.duration}</p>}
                {exp.description && <p className="text-sm text-gray-700 mt-2">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (!extractedData?.education || extractedData.education.length === 0) return null;

    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Education</h3>
            <button
              onClick={() => handleEditSection('education', extractedData.education)}
              className="btn btn-ghost btn-sm"
            >
              <EditIcon />
              Edit
            </button>
          </div>
          
          <div className="space-y-4 mt-4">
            {extractedData.education.map((edu, index) => (
              <div key={index} className="border-l-4 border-green-200 pl-4">
                <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                {edu.institution && <p className="text-gray-600">{edu.institution}</p>}
                {edu.duration && <p className="text-sm text-gray-500">{edu.duration}</p>}
                {edu.details && <p className="text-sm text-gray-700 mt-2">{edu.details}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (!extractedData?.skills) return null;

    const skills = extractedData.skills;
    const hasSkills = Object.values(skills).some(skillArray => skillArray && skillArray.length > 0);
    
    if (!hasSkills) return null;

    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Skills</h3>
            <button
              onClick={() => handleEditSection('skills', skills)}
              className="btn btn-ghost btn-sm"
            >
              <EditIcon />
              Edit
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {skills.technical && skills.technical.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.technical.map((skill, index) => (
                    <span key={index} className="badge badge-primary badge-outline">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {skills.languages && skills.languages.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.languages.map((skill, index) => (
                    <span key={index} className="badge badge-secondary badge-outline">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {skills.tools && skills.tools.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tools & Software</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((skill, index) => (
                    <span key={index} className="badge badge-accent badge-outline">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {skills.other && skills.other.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Other Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.other.map((skill, index) => (
                    <span key={index} className="badge badge-neutral badge-outline">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handlePdfJsLoad}
      />
      
      <div className="space-y-8">
        {/* Upload Section */}
      {!extractedData && (
        <div className="card bg-white shadow-lg border border-gray-200">
          <div className="card-body">
            <h2 className="text-2xl font-bold mb-4">Upload Your Resume</h2>
            
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileIcon />
              <h3 className="text-lg font-semibold text-gray-900 mt-4">
                {file ? file.name : 'Drop your resume here, or click to browse'}
              </h3>
              <p className="text-gray-600 mt-2">
                Supports PDF, DOCX, DOC, and TXT files up to {MAX_FILE_SIZE / 1024 / 1024}MB
              </p>
              
              {file && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <CheckIcon />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-gray-500">({formatFileSize(file.size)})</span>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileInput}
              />
              
              <div className="mt-6 space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline"
                >
                  Choose File
                </button>
                
                {file && (
                  <button
                    onClick={uploadAndExtract}
                    disabled={uploading}
                    className="btn btn-primary"
                  >
                    {uploading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-5 h-5" />
                        Extract Data
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Data Display */}
      {extractedData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Extracted Resume Data</h2>
              <p className="text-gray-600 mt-1">Review and edit the information below</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setExtractedData(null);
                  setOriginalText('');
                }}
                className="btn btn-outline btn-sm"
              >
                Upload New Resume
              </button>
              <button
                onClick={() => router.push('/portfolios/new')}
                className="btn btn-primary btn-sm"
              >
                Create Portfolio
              </button>
            </div>
          </div>

          {renderPersonalInfo()}
          {extractedData.summary && (
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body">
                <h3 className="text-lg font-semibold">Professional Summary</h3>
                <p className="text-gray-700 mt-2">{extractedData.summary}</p>
              </div>
            </div>
          )}
          {renderExperience()}
          {renderEducation()}
          {renderSkills()}
          
          {/* Projects */}
          {extractedData.projects && extractedData.projects.length > 0 && (
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body">
                <h3 className="text-lg font-semibold">Projects</h3>
                <div className="space-y-4 mt-4">
                  {extractedData.projects.map((project, index) => (
                    <div key={index} className="border-l-4 border-purple-200 pl-4">
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      {project.description && <p className="text-sm text-gray-700 mt-1">{project.description}</p>}
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                          View Project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Raw Text Preview */}
          {originalText && (
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body">
                <h3 className="text-lg font-semibold">Original Text</h3>
                <div className="bg-gray-50 p-4 rounded-lg mt-4 max-h-60 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {originalText}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}