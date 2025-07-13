"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function PortfolioTemplate({ portfolio }) {
  const [activeSection, setActiveSection] = useState("about");
  const [isScrolled, setIsScrolled] = useState(false);

  const content = portfolio.content_data || {};
  const projects = portfolio.portfolio_projects || [];
  const profile = portfolio.profiles;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  const featuredProjects = projects.filter(p => p.is_featured).slice(0, 4);
  const allProjects = projects.slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-transparent"
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className={`text-xl font-bold transition-colors ${
              isScrolled ? "text-gray-900" : "text-white"
            }`}>
              {content.personal_info?.name || profile?.full_name || portfolio.title}
            </h1>
            
            <div className="hidden md:flex space-x-8">
              {["about", "projects", "skills", "contact"].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`capitalize font-medium transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-blue-600" : "text-white hover:text-blue-200"
                  } ${activeSection === section ? "text-blue-600" : ""}`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative text-center text-white px-6">
          {content.personal_info?.avatar_url && (
            <div className="mb-8">
              <Image
                src={content.personal_info.avatar_url}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-full mx-auto border-4 border-white shadow-xl"
              />
            </div>
          )}
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {content.personal_info?.name || profile?.full_name || "Developer"}
          </h1>
          
          {content.bio && (
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              {content.bio}
            </p>
          )}
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {content.personal_info?.github_url && (
              <a
                href={content.personal_info.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-white"
              >
                GitHub
              </a>
            )}
            {content.personal_info?.website && (
              <a
                href={content.personal_info.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-white"
              >
                Website
              </a>
            )}
            <button
              onClick={() => scrollToSection("contact")}
              className="btn btn-primary"
            >
              Get In Touch
            </button>
          </div>
          
          <button
            onClick={() => scrollToSection("about")}
            className="animate-bounce text-white hover:text-blue-200"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Me</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {content.summary ? (
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  {content.summary}
                </p>
              ) : (
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Passionate developer with experience building innovative solutions.
                </p>
              )}
              
              {content.stats && (
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {content.stats.total_repos || 0}
                    </div>
                    <div className="text-gray-600">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {content.stats.total_stars || 0}
                    </div>
                    <div className="text-gray-600">GitHub Stars</div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              {content.personal_info?.location && (
                <div className="mb-4">
                  <span className="font-semibold text-gray-900">Location:</span>
                  <span className="ml-2 text-gray-600">{content.personal_info.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Skills & Technologies</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          {content.skills && content.skills.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4">
              {content.skills.map((skill, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <span className="font-medium text-gray-800">{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p>Skills and technologies will be displayed here once connected platforms are synced.</p>
            </div>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Projects</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            {allProjects.length > 0 && (
              <p className="text-gray-600 mt-4">
                Showcasing {allProjects.length} of my best projects • {featuredProjects.length} featured
              </p>
            )}
          </div>
          
          {allProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {project.enhanced_description || project.description}
                    </p>
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 4).map((tech, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4 text-sm text-gray-500">
                        {project.metrics?.stars > 0 && (
                          <span>⭐ {project.metrics.stars}</span>
                        )}
                        {project.metrics?.forks > 0 && (
                          <span>🍴 {project.metrics.forks}</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {project.links?.github && (
                          <a
                            href={project.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline"
                          >
                            Code
                          </a>
                        )}
                        {(project.links?.demo || project.links?.live) && (
                          <a
                            href={project.links.demo || project.links.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <div className="text-6xl mb-4">🚀</div>
              <p>Projects will be displayed here once GitHub is connected and synced.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Let&apos;s Work Together</h2>
          <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
          
          <p className="text-xl mb-8 opacity-90">
            Interested in collaborating? I&apos;d love to hear from you.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            {content.personal_info?.github_url && (
              <a
                href={content.personal_info.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-white"
              >
                GitHub
              </a>
            )}
            {content.personal_info?.website && (
              <a
                href={content.personal_info.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-white"
              >
                Website
              </a>
            )}
            <a
              href={`mailto:${portfolio.profiles?.email || 'hello@example.com'}`}
              className="btn btn-white"
            >
              Send Email
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2024 {content.personal_info?.name || profile?.full_name || portfolio.title}. 
            Portfolio powered by <a href="https://folyx.me" className="text-blue-400 hover:text-blue-300">Folyx</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}