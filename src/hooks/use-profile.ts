import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: { display_name?: string; bio?: string; avatar_url?: string }) => {
      if (!user) {
        toast({ title: "Not signed in", description: "Please sign in to update your profile.", variant: "destructive" });
        return false;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
        return false;
      }

      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
      toast({ title: "Profile updated", description: "Your changes have been saved." });
      return true;
    },
    [user, toast]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) return null;

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache-busting param
      const url = `${publicUrl}?t=${Date.now()}`;
      await updateProfile({ avatar_url: url });
      return url;
    },
    [user, toast, updateProfile]
  );

  return { profile, isLoading, updateProfile, uploadAvatar, refetch: fetchProfile };
}
