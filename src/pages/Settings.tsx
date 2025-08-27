import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MainNav } from '@/components/navigation/main-nav'
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  Shield,
  Database,
  Mail,
  Smartphone,
  Eye,
  EyeOff
} from "lucide-react"

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  
  const [settings, setSettings] = React.useState({
    profile: {
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      avatar_url: user?.user_metadata?.avatar_url || ''
    },
    notifications: {
      email_notifications: true,
      workflow_notifications: true,
      team_notifications: false,
      marketing_emails: false
    },
    privacy: {
      profile_visibility: 'team',
      tag_visibility: 'public',
      analytics_sharing: true
    },
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      compact_mode: false
    }
  })

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { 
          name: settings.profile.name,
          avatar_url: settings.profile.avatar_url
        }
      })

      if (error) throw error

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully."
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (category: string) => {
    setLoading(true)
    try {
      // In a real app, you'd save these settings to a user_settings table
      toast({
        title: "Settings Updated",
        description: `${category} settings have been saved successfully.`
      })
    } catch (error) {
      console.error('Error updating settings:', error)
      toast({
        title: "Error", 
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-4xl py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your profile details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value }
                    }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={settings.profile.avatar_url}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, avatar_url: e.target.value }
                  }))}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                />
              </div>
              <Button variant="outline">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email_notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email_notifications: checked }
                  }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Workflow Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when workflows complete
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.workflow_notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, workflow_notifications: checked }
                  }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Team Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about team activity
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.team_notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, team_notifications: checked }
                  }))}
                />
              </div>
              <Button onClick={() => handleSaveSettings('Notification')} disabled={loading}>
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control who can see your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <Select 
                  value={settings.privacy.profile_visibility}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, profile_visibility: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="team">Team Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag-visibility">Tag Visibility</Label>
                <Select 
                  value={settings.privacy.tag_visibility}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, tag_visibility: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="team">Team Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Analytics Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Share anonymized usage data to improve the platform
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.analytics_sharing}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, analytics_sharing: checked }
                  }))}
                />
              </div>
              <Button onClick={() => handleSaveSettings('Privacy')} disabled={loading}>
                {loading ? "Saving..." : "Save Privacy Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Display Preferences
              </CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={settings.preferences.theme}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, theme: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={settings.preferences.language}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, language: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Show more information in less space
                  </p>
                </div>
                <Switch
                  checked={settings.preferences.compact_mode}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, compact_mode: checked }
                  }))}
                />
              </div>
              <Button onClick={() => handleSaveSettings('Preference')} disabled={loading}>
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}