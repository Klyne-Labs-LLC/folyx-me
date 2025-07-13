"use client";

import { useEffect } from "react";
import apiClient from "@/libs/api";

// Component to ensure user profile exists in database
const ProfileEnsurer = ({ hasProfile = false }) => {
  useEffect(() => {
    const ensureProfile = async () => {
      if (!hasProfile) {
        try {
          await apiClient.post("/user/ensure-profile");
          // Refresh the page to show updated profile data
          window.location.reload();
        } catch (error) {
          console.error("Failed to ensure profile:", error);
        }
      }
    };

    ensureProfile();
  }, [hasProfile]);

  return null; // This component doesn't render anything
};

export default ProfileEnsurer;