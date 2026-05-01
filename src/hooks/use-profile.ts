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
  theme: string;
  notifications_enabled: boolean;
  auto_save: boolean;
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
      setProfile(data as Profile | null);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<Profile, "display_name" | "bio" | "avatar_url" | "theme" | "notifications_enabled" | "auto_save">>) => {
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

      setProfile((prev) => (prev ? { ...prev, ...updates } as Profile : prev));
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

      const url = `${publicUrl}?t=${Date.now()}`;
      await updateProfile({ avatar_url: url });
      return url;
    },
    [user, toast, updateProfile]
  );

  const registerDeviceToken = useCallback(
    async (token: string, platform: "ios" | "android" | "web") => {
      if (!user) return false;
      const { error } = await supabase
        .from("device_tokens")
        .upsert({ user_id: user.id, token, platform }, { onConflict: "user_id,token" });
      if (error) {
        console.error("registerDeviceToken error", error);
        return false;
      }
      return true;
    },
    [user]
  );

  return { profile, isLoading, updateProfile, uploadAvatar, registerDeviceToken, refetch: fetchProfile };
}
