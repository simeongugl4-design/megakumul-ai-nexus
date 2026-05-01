import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, Save, Mail, Shield, Bell, Palette, Loader2, LogOut, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { initPushNotifications, isNativePlatform, sendTestLocalNotification } from "@/lib/push-notifications";
import { toast } from "sonner";

import { useTheme, Theme } from "@/components/ThemeProvider";
import { Capacitor } from "@capacitor/core";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, isLoading, updateProfile, uploadAvatar, registerDeviceToken } = useProfile();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("creative");

  // Preferences come from profile when available, fall back to local defaults
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      if (profile.theme && profile.theme !== theme) setTheme(profile.theme as Theme);
      setNotifications(profile.notifications_enabled);
      setAutoSave(profile.auto_save);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile({ display_name: displayName.trim(), bio: bio.trim() });
    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File must be under 2MB");
      return;
    }
    setUploading(true);
    await uploadAvatar(file);
    setUploading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleToggleNotifications = async () => {
    const next = !notifications;
    setNotifications(next);
    if (next && isNativePlatform()) {
      const result = await initPushNotifications({
        onToken: (t) => {
          toast.success("Push notifications enabled");
          console.info("Device push token:", t);
        },
        onReceived: (n) => toast(n.title || "Notification", { description: n.body }),
        onError: () => {
          toast.error("Could not enable push notifications");
          setNotifications(false);
        },
      });
      if (!result) setNotifications(false);
    } else if (next) {
      toast.info("Push notifications activate when running as a native app");
    }
  };

  const handleTestNotification = async () => {
    if (!isNativePlatform()) {
      toast.info("Test notifications run on the installed iOS/Android app");
      return;
    }
    await sendTestLocalNotification("MegaKUMUL", "This is a test notification 🎉");
    toast.success("Test notification scheduled");
  };

  const isGuest = !user;

  return (
    <div className="flex h-screen flex-col">
      <TopNav selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-heading font-bold gradient-text mb-2">Settings</h1>
            <p className="text-muted-foreground mb-8">Manage your profile and preferences</p>

            {/* Profile Section */}
            <div className="rounded-2xl border border-border bg-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-semibold text-foreground">Profile</h2>
              </div>

              <div className="flex items-center gap-6 mb-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGuest || uploading}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {isGuest ? "Sign in to manage your profile" : user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click avatar to upload (JPG, PNG, WebP • max 2MB)
                  </p>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isGuest}
                    maxLength={100}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={isGuest}
                    maxLength={500}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{bio.length}/500</p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isGuest || saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Profile
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="rounded-2xl border border-border bg-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-semibold text-foreground">Preferences</h2>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Theme</p>
                    <p className="text-xs text-muted-foreground">Choose your interface theme</p>
                  </div>
                  <div className="flex gap-1 rounded-xl border border-border p-1">
                    {(["dark", "light", "system"] as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTheme(t);
                          updateProfile({ theme: t });
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                          theme === t
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Bell className="h-4 w-4" /> Notifications
                    </p>
                    <p className="text-xs text-muted-foreground">Receive updates and alerts</p>
                  </div>
                  <button
                    onClick={handleToggleNotifications}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        notifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Smartphone className="h-4 w-4" /> Test push notification
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isNativePlatform()
                        ? "Send yourself a test notification"
                        : "Available on the installed iOS/Android app"}
                    </p>
                  </div>
                  <button
                    onClick={handleTestNotification}
                    className="rounded-xl border border-border px-4 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Send test
                  </button>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Save className="h-4 w-4" /> Auto-save responses
                    </p>
                    <p className="text-xs text-muted-foreground">Automatically save AI responses to history</p>
                  </div>
                  <button
                    onClick={() => setAutoSave(!autoSave)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoSave ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        autoSave ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Account */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-semibold text-foreground">Account</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email || "Not signed in"}</p>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 px-6 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/auth")}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
                  >
                    Sign In to unlock all features
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
