"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/libs/api";
import toast from "react-hot-toast";

const TEMPLATES = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, minimalist design perfect for developers and professionals",
    preview: "🎯",
    color: "bg-blue-500"
  },
  {
    id: "creative",
    name: "Creative Showcase",
    description: "Bold, artistic design for designers and creative professionals",
    preview: "🎨",
    color: "bg-purple-500"
  },
  {
    id: "developer",
    name: "Developer Focus",
    description: "Technical layout highlighting code projects and contributions",
    preview: "💻",
    color: "bg-green-500"
  }
];

export default function PortfolioCreateClient({ connections, userContent }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    template_id: "modern",
    subdomain: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedSources, setSelectedSources] = useState({
    platforms: [],
    content: []
  });
  const [subdomainCheck, setSubdomainCheck] = useState({
    checking: false,
    available: null,
    message: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-generate subdomain from title
    if (name === "title" && !formData.subdomain) {
      const autoSubdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 30);
      
      setFormData(prev => ({
        ...prev,
        subdomain: autoSubdomain
      }));
    }
  };

  const checkSubdomainAvailability = async (subdomain) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainCheck({
        checking: false,
        available: false,
        message: "Subdomain must be at least 3 characters long"
      });
      return;
    }

    setSubdomainCheck({ checking: true, available: null, message: "Checking..." });

    try {
      const response = await apiClient.post("/portfolios/check-subdomain", { subdomain });
      setSubdomainCheck({
        checking: false,
        available: true,
        message: response.message
      });
    } catch (error) {
      setSubdomainCheck({
        checking: false,
        available: false,
        message: error.message || "Subdomain not available"
      });
    }
  };

  const handleSubdomainChange = (e) => {
    const subdomain = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 63);
    
    setFormData(prev => ({
      ...prev,
      subdomain
    }));

    setSubdomainCheck({ checking: false, available: null, message: "" });

    // Debounce subdomain check
    if (subdomain) {
      setTimeout(() => checkSubdomainAvailability(subdomain), 500);
    }
  };

  const handleTemplateSelect = (templateId) => {
    setFormData(prev => ({
      ...prev,
      template_id: templateId
    }));
  };

  const handleSourceToggle = (type, sourceId) => {
    setSelectedSources(prev => ({
      ...prev,
      [type]: prev[type].includes(sourceId) 
        ? prev[type].filter(id => id !== sourceId)
        : [...prev[type], sourceId]
    }));
  };

  const getSelectedConnections = () => {
    return connections.filter(conn => selectedSources.platforms.includes(conn.id));
  };

  const getSelectedContent = () => {
    return userContent.filter(content => selectedSources.content.includes(content.id));
  };

  const handleCreatePortfolio = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a portfolio title");
      return;
    }

    setIsCreating(true);

    try {
      // Create portfolio
      const portfolioResponse = await apiClient.post("/portfolios", formData);
      const portfolio = portfolioResponse.portfolio;

      toast.success("Portfolio created successfully!");

      // Get selected data sources
      const selectedConnections = getSelectedConnections();
      const selectedContentSources = getSelectedContent();
      
      // If user has selected data sources, trigger content generation
      if (selectedConnections.length > 0 || selectedContentSources.length > 0) {
        const sourcesList = [];
        if (selectedConnections.length > 0) sourcesList.push(`${selectedConnections.length} platform(s)`);
        if (selectedContentSources.length > 0) sourcesList.push(`${selectedContentSources.length} document(s)`);
        
        toast.loading(`Generating content from your selected ${sourcesList.join(" and ")}...`, { duration: 3000 });
        
        try {
          await apiClient.post(`/portfolios/${portfolio.id}/generate`, {
            selectedSources: {
              connections: selectedConnections.map(c => c.id),
              content: selectedContentSources.map(c => c.id)
            }
          });
          toast.success(`Portfolio content generated from your selected ${sourcesList.join(" and ")}!`);
        } catch (generateError) {
          console.error("Generation error:", generateError);
          toast.error("Portfolio created, but content generation failed. You can try again later.");
        }
      }

      // Redirect to portfolio editor
      router.push(`/portfolios/${portfolio.id}`);

    } catch (error) {
      console.error("Portfolio creation error:", error);
      toast.error(error.message || "Failed to create portfolio");
    } finally {
      setIsCreating(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-8">
        {/* Data Sources Overview */}
        <div className="card bg-white shadow-lg border border-gray-200">
          <div className="card-body">
            <h2 className="card-title text-gray-900 mb-4">📊 Available Data Sources</h2>
            <p className="text-gray-600 mb-4">
              Your portfolio will be generated using the following connected data sources:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GitHub Connection */}
              {connections.find(c => c.platform === 'github') ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white text-sm">
                    🐙
                  </div>
                  <div>
                    <p className="font-medium text-green-800">GitHub Connected</p>
                    <p className="text-sm text-green-600">
                      @{connections.find(c => c.platform === 'github').platform_username}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center text-white text-sm">
                    🐙
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">GitHub Not Connected</p>
                    <p className="text-sm text-gray-500">
                      <a href="/integrations" className="link link-primary">Connect GitHub</a>
                    </p>
                  </div>
                </div>
              )}

              {/* Resume Data */}
              {userContent.find(c => c.content_type === 'resume') ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white text-sm">
                    📄
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Resume Uploaded</p>
                    <p className="text-sm text-green-600">
                      Professional data extracted
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center text-white text-sm">
                    📄
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Resume Not Uploaded</p>
                    <p className="text-sm text-gray-500">
                      <a href="/content/resume" className="link link-primary">Upload Resume</a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {(connections.length > 0 || userContent.length > 0) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✨ <strong>AI will automatically merge and enhance</strong> your data from all connected sources 
                  to create a comprehensive, professional portfolio.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Details */}
        <div className="card bg-white shadow-lg border border-gray-200">
          <div className="card-body">
            <h2 className="card-title text-gray-900 mb-6">Portfolio Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Portfolio Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="My Professional Portfolio"
                  className="input input-bordered w-full"
                  required
                />
                <label className="label">
                  <span className="label-text-alt">This will be displayed as your portfolio title</span>
                </label>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Subdomain *</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={handleSubdomainChange}
                    placeholder="your-name"
                    className={`input input-bordered flex-1 ${
                      subdomainCheck.available === true ? "input-success" :
                      subdomainCheck.available === false ? "input-error" : ""
                    }`}
                    required
                  />
                  <span className="text-gray-500">.folyx.me</span>
                </div>
                <label className="label">
                  <span className={`label-text-alt ${
                    subdomainCheck.available === true ? "text-success" :
                    subdomainCheck.available === false ? "text-error" : ""
                  }`}>
                    {subdomainCheck.checking ? (
                      <span className="flex items-center gap-1">
                        <span className="loading loading-spinner loading-xs"></span>
                        Checking availability...
                      </span>
                    ) : subdomainCheck.message ? (
                      subdomainCheck.message
                    ) : (
                      "Choose a unique subdomain for your portfolio URL"
                    )}
                  </span>
                </label>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="A brief description of your portfolio..."
                  className="textarea textarea-bordered w-full h-24"
                />
                <label className="label">
                  <span className="label-text-alt">Optional: Describe what visitors will find in your portfolio</span>
                </label>
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.title.trim() || !formData.subdomain.trim() || subdomainCheck.available !== true}
                className="btn btn-primary"
              >
                Next: Select Data Sources
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Connected Platforms Preview */}
        {connections.length > 0 && (
          <div className="card bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900">🚀 Ready for AI Generation</h3>
              <p className="text-base-content/80 mb-4">
                We&apos;ll automatically generate content from your connected platforms:
              </p>
              <div className="flex flex-wrap gap-2">
                {connections.map(connection => (
                  <div key={connection.id} className="badge badge-success badge-lg">
                    {connection.platform_type === "github" ? "🐙" : "📱"} {connection.platform_type}
                    {connection.platform_data?.repositories && 
                      ` (${connection.platform_data.repositories.length} repos)`
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Connections Warning */}
        {connections.length === 0 && (
          <div className="card bg-yellow-50 border border-yellow-200">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900">⚠️ No Connected Platforms</h3>
              <p className="text-base-content/80 mb-4">
                You haven&apos;t connected any platforms yet. Your portfolio will be created with placeholder content.
              </p>
              <a href="/integrations" className="btn btn-outline btn-sm">
                Connect Platforms First
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-8">
        {/* Data Source Selection */}
        <div className="card bg-white shadow-lg border border-gray-200">
          <div className="card-body">
            <h2 className="card-title text-gray-900 mb-4">📊 Select Data Sources</h2>
            <p className="text-gray-600 mb-6">
              Choose which platforms and documents to include in your portfolio generation.
            </p>
            
            {/* Platform Selection */}
            {connections.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Connected Platforms</h3>
                <div className="space-y-3">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        id={`platform-${connection.id}`}
                        className="checkbox checkbox-primary"
                        checked={selectedSources.platforms.includes(connection.id)}
                        onChange={() => handleSourceToggle('platforms', connection.id)}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white text-sm">
                          {connection.platform === 'github' ? '🐙' : '📱'}
                        </div>
                        <div>
                          <label htmlFor={`platform-${connection.id}`} className="font-medium text-gray-900 cursor-pointer">
                            {connection.platform === 'github' ? 'GitHub' : connection.platform}
                          </label>
                          <p className="text-sm text-gray-600">
                            @{connection.platform_username}
                            {connection.profile_data?.public_repos && 
                              ` • ${connection.profile_data.public_repos} repositories`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Selection */}
            {userContent.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
                <div className="space-y-3">
                  {userContent.map((content) => (
                    <div key={content.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        id={`content-${content.id}`}
                        className="checkbox checkbox-primary"
                        checked={selectedSources.content.includes(content.id)}
                        onChange={() => handleSourceToggle('content', content.id)}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white text-sm">
                          📄
                        </div>
                        <div>
                          <label htmlFor={`content-${content.id}`} className="font-medium text-gray-900 cursor-pointer">
                            {content.content_type === 'resume' ? 'Resume/CV' : content.content_type}
                          </label>
                          <p className="text-sm text-gray-600">
                            Uploaded {new Date(content.created_at).toLocaleDateString()}
                            {content.metadata?.fileName && ` • ${content.metadata.fileName}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No sources available */}
            {connections.length === 0 && userContent.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-3">📭</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Sources Available</h3>
                <p className="text-gray-600 mb-4">
                  You haven't connected any platforms or uploaded any documents yet.
                </p>
                <div className="flex gap-3 justify-center">
                  <a href="/integrations" className="btn btn-primary btn-sm">
                    Connect Platforms
                  </a>
                  <a href="/content/resume" className="btn btn-outline btn-sm">
                    Upload Resume
                  </a>
                </div>
              </div>
            )}

            {/* Selection Summary */}
            {(connections.length > 0 || userContent.length > 0) && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Selection Summary</h4>
                <div className="text-sm text-blue-800">
                  {selectedSources.platforms.length > 0 && (
                    <p>✓ {selectedSources.platforms.length} platform(s) selected</p>
                  )}
                  {selectedSources.content.length > 0 && (
                    <p>✓ {selectedSources.content.length} document(s) selected</p>
                  )}
                  {selectedSources.platforms.length === 0 && selectedSources.content.length === 0 && (
                    <p className="text-blue-600">⚠️ No sources selected - portfolio will be created with placeholder content</p>
                  )}
                </div>
              </div>
            )}

            <div className="card-actions justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className="btn btn-outline"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              
              <button
                onClick={() => setStep(3)}
                className="btn btn-primary"
              >
                Next: Choose Template
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Template Selection */}
      <div className="card bg-white shadow-lg border border-gray-200">
        <div className="card-body">
          <h2 className="card-title text-gray-900 mb-6">Choose Template</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={`card cursor-pointer transition-all duration-200 ${
                  formData.template_id === template.id
                    ? "ring-2 ring-primary shadow-lg"
                    : "border border-gray-200 hover:shadow-md"
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="card-body p-6">
                  <div className={`w-16 h-16 ${template.color} rounded-lg flex items-center justify-center text-white text-3xl mb-4`}>
                    {template.preview}
                  </div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-sm text-base-content/70">{template.description}</p>
                  
                  {formData.template_id === template.id && (
                    <div className="mt-4">
                      <div className="badge badge-primary">Selected</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="card-actions justify-between mt-6">
            <button
              onClick={() => setStep(2)}
              className="btn btn-outline"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <button
              onClick={handleCreatePortfolio}
              disabled={isCreating}
              className="btn btn-primary"
            >
              {isCreating ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating Portfolio...
                </>
              ) : (
                <>
                  Create Portfolio
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card bg-base-100 border border-gray-200">
        <div className="card-body">
          <h3 className="text-lg font-semibold">Portfolio Summary</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Title:</span> {formData.title}</p>
            <p><span className="font-medium">URL:</span> 
              <span className="font-mono text-blue-600">{formData.subdomain}.folyx.me</span>
            </p>
            {formData.description && (
              <p><span className="font-medium">Description:</span> {formData.description}</p>
            )}
            <p><span className="font-medium">Template:</span> {TEMPLATES.find(t => t.id === formData.template_id)?.name}</p>
            <p><span className="font-medium">Selected Sources:</span> {
              (() => {
                const sources = [];
                if (selectedSources.platforms.length > 0) sources.push(`${selectedSources.platforms.length} platform(s)`);
                if (selectedSources.content.length > 0) sources.push(`${selectedSources.content.length} document(s)`);
                return sources.length > 0 ? sources.join(", ") : "Manual content only";
              })()
            }</p>
          </div>
        </div>
      </div>
    </div>
  );
}