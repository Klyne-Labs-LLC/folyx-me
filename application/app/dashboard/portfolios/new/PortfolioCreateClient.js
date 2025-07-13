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

export default function PortfolioCreateClient({ connections }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    template_id: "modern"
  });
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTemplateSelect = (templateId) => {
    setFormData(prev => ({
      ...prev,
      template_id: templateId
    }));
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

      // If user has connected platforms, trigger content generation
      if (connections.length > 0) {
        toast.loading("Generating content from your connected platforms...", { duration: 3000 });
        
        try {
          await apiClient.post(`/portfolios/${portfolio.id}/generate`);
          toast.success("Portfolio content generated from your platforms!");
        } catch (generateError) {
          console.error("Generation error:", generateError);
          toast.error("Portfolio created, but content generation failed. You can try again later.");
        }
      }

      // Redirect to portfolio editor
      router.push(`/dashboard/portfolios/${portfolio.id}`);

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
                disabled={!formData.title.trim()}
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
              <a href="/dashboard/integrations" className="btn btn-outline btn-sm">
                Connect Platforms First
              </a>
            </div>
          </div>
        )}
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
              onClick={() => setStep(1)}
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
            {formData.description && (
              <p><span className="font-medium">Description:</span> {formData.description}</p>
            )}
            <p><span className="font-medium">Template:</span> {TEMPLATES.find(t => t.id === formData.template_id)?.name}</p>
            <p><span className="font-medium">Data Sources:</span> {connections.length > 0 ? `${connections.length} connected platform(s)` : "Manual content only"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}