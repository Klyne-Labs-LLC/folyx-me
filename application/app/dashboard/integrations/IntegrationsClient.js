"use client";

import { useState } from "react";
import apiClient from "@/libs/api";
import toast from "react-hot-toast";

// Platform Icon Components
const GitHubIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 250" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.12-23.82-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.944.876-7.944 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 4.981-25.411 13.132-34.358-1.329-3.224-5.688-16.18 1.24-33.742 0 0 10.707-3.427 35.073 13.132 10.17-2.826 21.078-4.242 31.914-4.29 10.836.048 21.752 1.464 31.942 4.29 24.337-16.559 35.026-13.132 35.026-13.132 6.951 17.562 2.579 30.518 1.27 33.742 8.163 8.947 13.112 20.383 13.112 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.319 7.367 8.802 6.124C219.37 232.5 256 184.537 256 128.001 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 256" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.456"/>
  </svg>
);

const DribbbleIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 256" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M128 8.5c66 0 119.4 53.4 119.4 119.3S194 247.2 128 247.2 8.6 193.8 8.6 127.9 62 8.5 128 8.5ZM128 248c66.2 0 120-53.8 120-120S194.2 8 128 8 8 61.8 8 128s53.8 120 120 120Zm-8.3-18.7c-2.2.1-4.4.1-6.7.1-18.2 0-35.1-4.6-49.9-12.7 3.8-6.5 19.4-32.2 58.9-45.3 11.8 30.5 16.6 56 17.7 63Zm22.4-7.4c-1.5-8.9-6.9-35.9-19.6-68.2 20.8-3.3 39.1 2.1 41.2 2.8-.9 18.3-6.7 35.1-16.2 49.9-1.8 5.1-3.8 10.1-5.4 15.5Zm19.4-60.5c.5-.3.9-.5 1.4-.8-2.4-5.4-5.1-10.9-8.2-16.2 25.1-10.2 35.9-25.3 36.8-26.5 8 9.6 12.8 21.8 13.5 35.2-19.9 4.1-33.9 6.4-43.5 8.3ZM173.1 89.5c-.7.9-10.1 14.5-33.8 23.4-7.9-14.4-16.6-26.4-17.8-28.2 13.4-5.4 28.2-6.1 41.6-2.6 4.7 1.2 8.9 3.9 10 7.4ZM108.1 89.7c1.1 1.7 9.5 13.7 17.4 27.7-22 5.8-41.4 5.7-43.5 5.7-.2-1.4-.3-2.9-.3-4.4 0-11.2 3.9-21.6 10.3-30.1 5.3.7 10.9 1.1 16.1 1.1ZM75.8 155.1c2.5 0 26.7.2 51.2-6.8.8 1.6 1.6 3.2 2.3 4.9-21.2 9.5-35.4 27.6-38.2 31.9-8.9-6.8-15.5-16.9-18.4-28.4-.3-.9-.6-1.7-.9-2.6Zm90.6 67.5c-9.2 6.9-20.4 11-32.6 11.5 2.2-7.9 7.6-34.2 19.7-65.1 11.4 21.9 16.1 40.8 16.7 45.2-.5 2.8-1.2 5.5-1.9 8.2-1.3.1-1.3.1-1.9.2Z"/>
  </svg>
);

const BehanceIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 160" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M76.5 49.4c4.1 0 7.8.7 11.1 2.1 3.3 1.4 6.1 3.3 8.3 5.8 2.2 2.5 3.9 5.4 5 8.7 1.1 3.3 1.7 6.8 1.7 10.5 0 3.9-.6 7.5-1.9 10.8-1.3 3.3-3.1 6.2-5.5 8.6-2.4 2.4-5.3 4.3-8.7 5.6-3.4 1.3-7.2 2-11.4 2H35.7V49.4h40.8ZM73.3 93.1c2.4 0 4.6-.4 6.6-1.1 2-.8 3.7-1.8 5.1-3.1 1.4-1.3 2.5-2.9 3.2-4.7.7-1.8 1.1-3.7 1.1-5.8 0-4.1-1.3-7.4-3.8-9.8-2.5-2.4-6-3.6-10.4-3.6H49.2v28.1h24.1Zm-.2-59.7H49.2v25.4h23.9c1.9 0 3.6-.3 5.2-.9 1.6-.6 2.9-1.4 4-2.4 1.1-1 1.9-2.2 2.5-3.6.6-1.4.9-2.8.9-4.3 0-3.2-1.1-5.7-3.2-7.5-2.1-1.8-5.1-2.7-8.8-2.7h-.4ZM140.1 160c-6.2 0-11.9-1.1-17.1-3.2-5.2-2.1-9.7-5.1-13.5-8.9-3.8-3.8-6.7-8.3-8.8-13.5-2.1-5.2-3.1-10.9-3.1-17.1 0-6.2 1-11.9 3.1-17.1 2.1-5.2 5-9.7 8.8-13.5 3.8-3.8 8.3-6.7 13.5-8.8 5.2-2.1 10.9-3.1 17.1-3.1 6.2 0 11.9 1 17.1 3.1 5.2 2.1 9.7 5 13.5 8.8 3.8 3.8 6.7 8.3 8.8 13.5 2.1 5.2 3.1 10.9 3.1 17.1 0 6.2-1 11.9-3.1 17.1-2.1 5.2-5 9.7-8.8 13.5-3.8 3.8-8.3 6.7-13.5 8.8-5.2 2.1-10.9 3.2-17.1 3.2Zm0-71.8c-4.3 0-8.1 1.5-11.3 4.5-3.2 3-4.8 7.2-4.8 12.6 0 5.4 1.6 9.6 4.8 12.6 3.2 3 7 4.5 11.3 4.5 4.3 0 8.1-1.5 11.3-4.5 3.2-3 4.8-7.2 4.8-12.6 0-5.4-1.6-9.6-4.8-12.6-3.2-3-7-4.5-11.3-4.5ZM220.2 49.4h39.1v14.3h-39.1V49.4Z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 209" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M256 25.45c-9.42 4.177-19.542 7-30.166 8.27 10.845-6.5 19.172-16.793 23.093-29.057a105.183 105.183 0 0 1-33.351 12.745C205.995 7.201 192.346.822 177.239.822c-29.006 0-52.523 23.516-52.523 52.52 0 4.117.465 8.125 1.36 11.97-43.65-2.191-82.35-23.1-108.255-54.876-4.52 7.757-7.11 16.78-7.11 26.404 0 18.222 9.273 34.297 23.365 43.716a52.312 52.312 0 0 1-23.79-6.57c-.003.22-.003.44-.003.661 0 25.447 18.104 46.675 42.13 51.5a52.592 52.592 0 0 1-23.718.9c6.683 20.866 26.08 36.05 49.062 36.475-17.975 14.086-40.622 22.483-65.228 22.483-4.24 0-8.42-.249-12.529-.734 23.243 14.902 50.85 23.597 80.51 23.597 96.607 0 149.434-80.031 149.434-149.435 0-2.278-.05-4.543-.152-6.795A106.748 106.748 0 0 0 256 25.45"/>
  </svg>
);

const MediumIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 146" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M72.2 0c39.877 0 72.2 32.549 72.2 72.7 0 40.15-32.323 72.7-72.2 72.7S0 112.85 0 72.7C0 32.549 32.323 0 72.2 0ZM187.3 17.17c19.938 0 36.1 24.8 36.1 55.53 0 30.73-16.162 55.53-36.1 55.53s-36.1-24.8-36.1-55.53c0-30.73 16.162-55.53 36.1-55.53ZM238 32.68c7.03 0 12.73 19.89 12.73 44.42s-5.7 44.42-12.73 44.42c-7.03 0-12.73-19.89-12.73-44.42s5.7-44.42 12.73-44.42Z"/>
  </svg>
);

const DevToIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 256" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5.3 5.3v245.4h245.4V5.3H5.3Zm190.1 164.9c0 17.1-1.9 39.4-23.6 39.4-21.7 0-23.6-22.3-23.6-39.4V85.8c0-17.1 1.9-39.4 23.6-39.4 21.7 0 23.6 22.3 23.6 39.4v84.4Zm-80.1-65.3h-7.6v79.5h8.2c19.5 0 22.3-9.3 22.3-27.2v-25.1c0-17.9-2.8-27.2-22.9-27.2Zm-48.1 0h29.4l-15.2 79.5H52l-5.1-19.9 11.5-11.1-5.1-48.5Z"/>
  </svg>
);

const SpotifyIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 256" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm58.7 184.7c-2.3 3.8-7.2 5-11 2.7-30.2-18.5-68.2-22.7-113-12.4-4.3 1-8.8-1.7-9.8-6.1s1.7-8.8 6.1-9.8c48.7-11.2 90.6-6.4 124.1 14.3 3.8 2.3 5 7.2 2.6 11.3zm15.7-34.9c-2.9 4.7-9.1 6.2-13.8 3.3-34.5-21.2-87.1-27.3-127.8-14.9-5.4 1.6-11.1-1.5-12.7-6.9s1.5-11.1 6.9-12.7c46.6-14.2 107.2-7.3 146.9 17.2 4.7 2.9 6.2 9.1 3.5 14z"/>
  </svg>
);

const SoundCloudIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 256" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.5 160v-48c0-6.6 5.4-12 12-12s12 5.4 12 12v48c0 6.6-5.4 12-12 12s-12-5.4-12-12zm24-64v80c0 6.6 5.4 12 12 12s12-5.4 12 12v-80c0-6.6-5.4-12-12-12s-12 5.4-12 12zm24-16v112c0 6.6 5.4 12 12 12s12-5.4 12-12V80c0-6.6-5.4-12-12-12s-12 5.4-12 12zm24-32v176c0 6.6 5.4 12 12 12s12-5.4 12-12V48c0-6.6-5.4-12-12-12s-12 5.4-12 12zm24 16v144c0 6.6 5.4 12 12 12h128c26.5 0 48-21.5 48-48s-21.5-48-48-48c-2.8 0-5.6.2-8.3.7C219.8 48.9 182.2 16 136 16c-23.3 0-44.4 9.5-59.6 24.8-3.1 3.1-8.2 3.1-11.3 0s-3.1-8.2 0-11.3C82.4 12.2 108.3 0 136 0c57.4 0 104 46.6 104 104 0 2.8-.1 5.6-.4 8.3 32.5 5.8 56.4 34.1 56.4 68.7 0 39.8-32.2 72-72 72H132c-6.6 0-12-5.4-12-12V64c0-6.6 5.4-12 12-12s12 5.4 12 12z"/>
  </svg>
);

const PLATFORMS = [
  {
    id: "github",
    name: "GitHub",
    icon: <GitHubIcon />,
    iconColor: "text-[#333]",
    description: "Import repositories, contributions, and profile information",
    inputType: "username",
    inputPlaceholder: "Enter your GitHub username",
    comingSoon: false
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: <LinkedInIcon />,
    iconColor: "text-[#0077B5]",
    description: "Import professional experience and education",
    comingSoon: true
  },
  {
    id: "dribbble",
    name: "Dribbble",
    icon: <DribbbleIcon />,
    iconColor: "text-[#EA4C89]",
    description: "Import design shots and creative work",
    comingSoon: true
  },
  {
    id: "behance",
    name: "Behance",
    icon: <BehanceIcon />,
    iconColor: "text-[#1769FF]",
    description: "Import creative projects and portfolio pieces",
    comingSoon: true
  }
];

export default function IntegrationsClient({ initialConnections }) {
  const [connections, setConnections] = useState(initialConnections);
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const [githubUsername, setGithubUsername] = useState("");

  const getConnectionStatus = (platformId) => {
    const connection = connections.find(c => c.platform_type === platformId);
    if (!connection) return "disconnected";
    return connection.sync_status;
  };

  const getConnection = (platformId) => {
    return connections.find(c => c.platform_type === platformId);
  };

  const handleConnectGitHub = async () => {
    if (!githubUsername.trim()) {
      toast.error("Please enter a GitHub username");
      return;
    }

    setConnectingPlatform("github");
    
    try {
      const response = await apiClient.post("/integrations/github/connect", {
        github_username: githubUsername.trim()
      });

      toast.success("GitHub connected successfully!");
      
      // Update connections state
      const existingIndex = connections.findIndex(c => c.platform_type === "github");
      if (existingIndex >= 0) {
        const newConnections = [...connections];
        newConnections[existingIndex] = response.connection;
        setConnections(newConnections);
      } else {
        setConnections([...connections, response.connection]);
      }

      setGithubUsername("");
    } catch (error) {
      console.error("GitHub connection error:", error);
      toast.error(error.message || "Failed to connect GitHub");
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId) => {
    const connection = getConnection(platformId);
    if (!connection) return;

    try {
      await apiClient.delete(`/integrations/${platformId}/disconnect`);
      toast.success(`${PLATFORMS.find(p => p.id === platformId)?.name} disconnected`);
      
      setConnections(connections.filter(c => c.id !== connection.id));
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect platform");
    }
  };

  const handleSync = async (platformId) => {
    const connection = getConnection(platformId);
    if (!connection) return;

    try {
      setConnectingPlatform(platformId);
      await apiClient.post(`/integrations/${platformId}/sync`, {
        connection_id: connection.id
      });
      
      toast.success("Sync completed successfully!");
      
      // Update connection status
      const updatedConnections = connections.map(c => 
        c.id === connection.id 
          ? { ...c, sync_status: "completed", last_sync: new Date().toISOString() }
          : c
      );
      setConnections(updatedConnections);
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync data");
    } finally {
      setConnectingPlatform(null);
    }
  };

  const formatLastSync = (lastSync) => {
    if (!lastSync) return "Never";
    const date = new Date(lastSync);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {PLATFORMS.map((platform) => {
        const status = getConnectionStatus(platform.id);
        const connection = getConnection(platform.id);
        const isConnecting = connectingPlatform === platform.id;

        return (
          <div key={platform.id} className="card bg-white shadow-lg border border-gray-200">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-3 shadow-sm">
                    <div className={`w-full h-full ${platform.iconColor}`}>
                      {platform.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      {platform.name}
                      {platform.comingSoon && (
                        <span className="badge badge-warning badge-sm">Coming Soon</span>
                      )}
                    </h3>
                    <p className="text-base-content/70 mt-1">{platform.description}</p>
                    
                    {connection && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Status:</span>{" "}
                          <span className={`capitalize ${
                            status === "completed" ? "text-success" :
                            status === "syncing" ? "text-warning" :
                            status === "error" ? "text-error" : "text-base-content"
                          }`}>
                            {status === "syncing" ? "Syncing..." : status}
                          </span>
                        </p>
                        {connection.platform_username && (
                          <p className="text-sm">
                            <span className="font-medium">Username:</span> {connection.platform_username}
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="font-medium">Last Sync:</span> {formatLastSync(connection.last_sync)}
                        </p>
                        {connection.sync_error && (
                          <p className="text-sm text-error">
                            <span className="font-medium">Error:</span> {connection.sync_error}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {platform.comingSoon ? (
                    <button className="btn btn-disabled">Coming Soon</button>
                  ) : status === "disconnected" ? (
                    <>
                      {platform.inputType === "username" && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={platform.inputPlaceholder}
                            value={githubUsername}
                            onChange={(e) => setGithubUsername(e.target.value)}
                            className="input input-bordered input-sm w-48"
                            disabled={isConnecting}
                          />
                          <button
                            onClick={handleConnectGitHub}
                            disabled={isConnecting}
                            className="btn btn-primary btn-sm"
                          >
                            {isConnecting ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              "Connect"
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSync(platform.id)}
                        disabled={isConnecting || status === "syncing"}
                        className="btn btn-outline btn-sm"
                      >
                        {isConnecting ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "Sync"
                        )}
                      </button>
                      <button
                        onClick={() => handleDisconnect(platform.id)}
                        className="btn btn-error btn-outline btn-sm"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {connection?.platform_data && (
                <div className="mt-4 p-4 bg-base-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Connected Data:</h4>
                  {platform.id === "github" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Public Repos:</span>
                        <div>{connection.platform_data.profile?.public_repos || 0}</div>
                      </div>
                      <div>
                        <span className="font-medium">Portfolio Repos:</span>
                        <div>{connection.platform_data.repositories?.length || 0}</div>
                      </div>
                      <div>
                        <span className="font-medium">Total Stars:</span>
                        <div>{connection.platform_data.stats?.total_stars || 0}</div>
                      </div>
                      <div>
                        <span className="font-medium">Followers:</span>
                        <div>{connection.platform_data.profile?.followers || 0}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Connected Platforms Summary */}
      {connections.length > 0 && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900">🎉 Great Progress!</h3>
            <p className="text-base-content/80">
              You have {connections.length} platform{connections.length !== 1 ? "s" : ""} connected. 
              Ready to <a href="/dashboard/portfolios/new" className="link link-primary">create your first portfolio</a>?
            </p>
          </div>
        </div>
      )}
    </div>
  );
}