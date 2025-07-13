"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/libs/api";
import toast from "react-hot-toast";

export default function PortfolioManagerClient({ portfolio: initialPortfolio, connections }) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleGenerateContent = async () => {
    if (connections.filter(c => c.sync_status === "completed").length === 0) {
      toast.error("No connected platforms available. Please connect a platform first.");
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await apiClient.post(`/portfolios/${portfolio.id}/generate`);
      
      setPortfolio(response.portfolio);
      toast.success("Portfolio content regenerated successfully!");
      
      // Refresh the page to show updated content
      window.location.reload();
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsUpdating(true);
    
    try {
      const newPublishState = !portfolio.is_published;
      const response = await apiClient.put(`/portfolios/${portfolio.id}`, {
        is_published: newPublishState
      });
      
      setPortfolio(response.portfolio);
      toast.success(newPublishState ? "Portfolio published!" : "Portfolio unpublished");
    } catch (error) {
      console.error("Publish toggle error:", error);
      toast.error("Failed to update publish status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePortfolio = async () => {
    if (!confirm("Are you sure you want to delete this portfolio? This action cannot be undone.")) {
      return;
    }

    try {
      await apiClient.delete(`/portfolios/${portfolio.id}`);
      toast.success("Portfolio deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete portfolio");
    }
  };

  const contentData = portfolio.content_data || {};
  const projects = portfolio.portfolio_projects || [];
  const connectedPlatforms = connections.filter(c => c.sync_status === "completed");

  return (
    <div className="space-y-8">
      {/* Portfolio Status Card */}
      <div className="card bg-white shadow-lg border border-gray-200">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="card-title text-gray-900">Portfolio Status</h2>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Status:</span>
                  <div className={`badge ${portfolio.is_published ? "badge-success" : "badge-warning"}`}>
                    {portfolio.is_published ? "Published" : "Draft"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">URL:</span>
                  {portfolio.is_published ? (
                    <a 
                      href={`/portfolio/${portfolio.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      /portfolio/{portfolio.slug}
                    </a>
                  ) : (
                    <span className="text-gray-500">Not published</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">Views:</span>
                  <span>{portfolio.view_count || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">Projects:</span>
                  <span>{projects.length}</span>
                </div>
                {portfolio.last_generated_at && (
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Last Generated:</span>
                    <span>{new Date(portfolio.last_generated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleTogglePublish}
                disabled={isUpdating}
                className={`btn ${portfolio.is_published ? "btn-warning" : "btn-success"}`}
              >
                {isUpdating ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : portfolio.is_published ? (
                  "Unpublish"
                ) : (
                  "Publish"
                )}
              </button>
              
              <button
                onClick={handleGenerateContent}
                disabled={isGenerating || connectedPlatforms.length === 0}
                className="btn btn-primary"
              >
                {isGenerating ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Generating...
                  </>
                ) : (
                  "Regenerate Content"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-bordered">
        <button
          className={`tab tab-lg ${activeTab === "overview" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab tab-lg ${activeTab === "projects" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          Projects ({projects.length})
        </button>
        <button
          className={`tab tab-lg ${activeTab === "settings" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Content Preview */}
          <div className="card bg-white shadow-lg border border-gray-200">
            <div className="card-body">
              <h3 className="text-xl font-semibold mb-4">Generated Content</h3>
              
              {contentData.personal_info ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Personal Information</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      {contentData.personal_info.name && (
                        <p><span className="font-medium">Name:</span> {contentData.personal_info.name}</p>
                      )}
                      {contentData.personal_info.location && (
                        <p><span className="font-medium">Location:</span> {contentData.personal_info.location}</p>
                      )}
                      {contentData.personal_info.github_url && (
                        <p><span className="font-medium">GitHub:</span> 
                          <a href={contentData.personal_info.github_url} className="link link-primary ml-1">
                            {contentData.personal_info.github_url}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {contentData.bio && (
                    <div>
                      <h4 className="font-medium text-gray-700">Bio</h4>
                      <p className="mt-2 text-sm text-gray-600">{contentData.bio}</p>
                    </div>
                  )}

                  {contentData.summary && (
                    <div>
                      <h4 className="font-medium text-gray-700">Summary</h4>
                      <p className="mt-2 text-sm text-gray-600">{contentData.summary}</p>
                    </div>
                  )}

                  {contentData.skills && contentData.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700">Skills</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {contentData.skills.slice(0, 10).map((skill, index) => (
                          <span key={index} className="badge badge-outline">
                            {skill}
                          </span>
                        ))}
                        {contentData.skills.length > 10 && (
                          <span className="badge badge-ghost">
                            +{contentData.skills.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {contentData.stats && (
                    <div>
                      <h4 className="font-medium text-gray-700">GitHub Stats</h4>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-lg">{contentData.stats.total_repos}</div>
                          <div className="text-gray-600">Repositories</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg">{contentData.stats.total_stars}</div>
                          <div className="text-gray-600">Stars</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg">{contentData.stats.total_forks}</div>
                          <div className="text-gray-600">Forks</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg">{Object.keys(contentData.stats.languages || {}).length}</div>
                          <div className="text-gray-600">Languages</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p>No content generated yet. Connect a platform and regenerate to see AI-generated content here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Connected Platforms Status */}
          <div className="card bg-white shadow-lg border border-gray-200">
            <div className="card-body">
              <h3 className="text-xl font-semibold mb-4">Data Sources</h3>
              
              {connections.length > 0 ? (
                <div className="space-y-3">
                  {connections.map(connection => (
                    <div key={connection.id} className="flex justify-between items-center p-3 bg-base-100 rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{connection.platform_type}</div>
                        <div className="text-sm text-gray-600">
                          {connection.platform_username && `@${connection.platform_username}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`badge ${
                          connection.sync_status === "completed" ? "badge-success" :
                          connection.sync_status === "syncing" ? "badge-warning" :
                          connection.sync_status === "error" ? "badge-error" : "badge-ghost"
                        }`}>
                          {connection.sync_status}
                        </div>
                        {connection.sync_status === "completed" && connection.platform_data?.repositories && (
                          <span className="text-sm text-gray-500">
                            {connection.platform_data.repositories.length} repos
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No platforms connected. <a href="/dashboard/integrations" className="link link-primary">Connect platforms</a> to enable AI content generation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="card bg-white shadow-lg border border-gray-200">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">Portfolio Projects</h3>
            
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map(project => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{project.title}</h4>
                      {project.is_featured && (
                        <span className="badge badge-primary badge-sm">Featured</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.enhanced_description || project.description}
                    </p>
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <span key={index} className="badge badge-outline badge-xs">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="badge badge-ghost badge-xs">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>From {project.source_platform}</span>
                      {project.metrics?.stars > 0 && (
                        <span>⭐ {project.metrics.stars}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🚀</div>
                <p>No projects yet. Connect GitHub and regenerate content to import your repositories.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="card bg-white shadow-lg border border-gray-200">
            <div className="card-body">
              <h3 className="text-xl font-semibold mb-4">Portfolio Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Title</span>
                  </label>
                  <input
                    type="text"
                    value={portfolio.title}
                    className="input input-bordered w-full"
                    readOnly
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Description</span>
                  </label>
                  <textarea
                    value={portfolio.description || ""}
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    readOnly
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Template</span>
                  </label>
                  <select className="select select-bordered w-full" value={portfolio.template_id} disabled>
                    <option value="modern">Modern Professional</option>
                    <option value="creative">Creative Showcase</option>
                    <option value="developer">Developer Focus</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Slug</span>
                  </label>
                  <input
                    type="text"
                    value={portfolio.slug}
                    className="input input-bordered w-full"
                    readOnly
                  />
                  <label className="label">
                    <span className="label-text-alt">Your portfolio URL: /portfolio/{portfolio.slug}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card bg-red-50 border border-red-200">
            <div className="card-body">
              <h3 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h3>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-red-900">Delete Portfolio</h4>
                  <p className="text-sm text-red-700">
                    This will permanently delete this portfolio and all its projects. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleDeletePortfolio}
                  className="btn btn-error"
                >
                  Delete Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}