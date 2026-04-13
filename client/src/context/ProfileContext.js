import React, { createContext, useContext, useMemo, useState } from "react";
import { buildRecommendations } from "../lib/recommendations";

const ProfileContext = createContext(null);

const initialProfile = {
  skills: "",
  interests: "",
  goals: "",
};

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(initialProfile);
  const [recommendations, setRecommendations] = useState(() =>
    buildRecommendations(initialProfile)
  );

  const value = useMemo(() => {
    function saveProfile(next) {
      setProfile(next);
      setRecommendations(buildRecommendations(next));
    }

    function reset() {
      setProfile(initialProfile);
      setRecommendations(buildRecommendations(initialProfile));
    }

    return {
      profile,
      recommendations,
      saveProfile,
      reset,
    };
  }, [profile, recommendations]);

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

