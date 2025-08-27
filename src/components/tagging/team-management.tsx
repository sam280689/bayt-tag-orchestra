import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { 
  Users, 
  Plus, 
  Settings, 
  Shield, 
  UserCheck,
  UserX,
  Crown,
  Edit,
  Trash2,
  Search,
  Filter
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "viewer"
  avatar?: string
  lastActive: string
  permissions: {
    canCreateTags: boolean
    canEditTags: boolean
    canDeleteTags: boolean
    canManageTeam: boolean
    canViewAnalytics: boolean
  }
  tagStats: {
    created: number
    used: number
    shared: number
  }
}

interface TeamSettings {
  requireApproval: boolean
  allowPublicTags: boolean
  autoSuggestSimilar: boolean
  enforceNamingConvention: boolean
  maxTagsPerUser: number
}

// Mock team data
const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Ahmed",
    email: "sarah.ahmed@company.com",
    role: "admin",
    avatar: "/avatars/sarah.jpg",
    lastActive: "2024-01-20T10:30:00Z",
    permissions: {
      canCreateTags: true,
      canEditTags: true,
      canDeleteTags: true,
      canManageTeam: true,
      canViewAnalytics: true,
    },
    tagStats: {
      created: 45,
      used: 234,
      shared: 12
    }
  },
  {
    id: "2", 
    name: "Ahmed Ali",
    email: "ahmed.ali@company.com",
    role: "editor",
    lastActive: "2024-01-19T15:45:00Z",
    permissions: {
      canCreateTags: true,
      canEditTags: true,
      canDeleteTags: false,
      canManageTeam: false,
      canViewAnalytics: true,
    },
    tagStats: {
      created: 23,
      used: 156,
      shared: 8
    }
  },
  {
    id: "3",
    name: "Fatima Hassan",
    email: "fatima.hassan@company.com", 
    role: "editor",
    lastActive: "2024-01-18T09:15:00Z",
    permissions: {
      canCreateTags: true,
      canEditTags: true,
      canDeleteTags: false,
      canManageTeam: false,
      canViewAnalytics: true,
    },
    tagStats: {
      created: 31,
      used: 189,
      shared: 15
    }
  },
  {
    id: "4",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "viewer",
    lastActive: "2024-01-15T14:20:00Z",
    permissions: {
      canCreateTags: false,
      canEditTags: false,
      canDeleteTags: false,
      canManageTeam: false,
      canViewAnalytics: false,
    },
    tagStats: {
      created: 0,
      used: 67,
      shared: 0
    }
  }
]

const mockTeamSettings: TeamSettings = {
  requireApproval: true,
  allowPublicTags: false,
  autoSuggestSimilar: true,
  enforceNamingConvention: false,
  maxTagsPerUser: 50
}

export function TeamManagement() {
  const { user } = useAuth()
  const [members, setMembers] = React.useState<TeamMember[]>([])
  const [settings, setSettings] = React.useState<TeamSettings>(mockTeamSettings)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string>("all")
  const [loading, setLoading] = React.useState(true)
  const [inviteEmail, setInviteEmail] = React.useState("")
  const [inviteRole, setInviteRole] = React.useState<"admin" | "editor" | "viewer">("viewer")
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      fetchTeamData()
    }
  }, [user])

  const fetchTeamData = async () => {
    try {
      // Fetch team members with profiles
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true })

      if (membersError) throw membersError

      // Get user profiles separately since the relation doesn't exist yet
      const memberIds = teamMembers?.map(m => m.user_id) || []
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', memberIds)

      if (profilesError) throw profilesError

      // Transform data to match interface
      const transformedMembers: TeamMember[] = teamMembers?.map(member => {
        const profile = profiles?.find(p => p.user_id === member.user_id)
        return {
          id: member.id,
          name: profile?.name || 'Unknown',
          email: profile?.email || '',
          role: member.role as "admin" | "editor" | "viewer",
          avatar: profile?.avatar_url,
          lastActive: member.last_active || member.created_at,
          permissions: (member.permissions as any) || {
            canCreateTags: false,
            canEditTags: false,
            canDeleteTags: false,
            canManageTeam: false,
            canViewAnalytics: false,
          },
          tagStats: (member.tag_stats as any) || { created: 0, used: 0, shared: 0 }
        }
      }) || []

      setMembers(transformedMembers)

      // Fetch team settings
      const { data: teamSettings, error: settingsError } = await supabase
        .from('team_settings')
        .select('*')
        .limit(1)
        .single()

      if (!settingsError && teamSettings) {
        setSettings({
          requireApproval: teamSettings.require_approval,
          allowPublicTags: teamSettings.allow_public_tags,
          autoSuggestSimilar: teamSettings.auto_suggest_similar,
          enforceNamingConvention: teamSettings.enforce_naming_convention,
          maxTagsPerUser: teamSettings.max_tags_per_user
        })
      }
      
    } catch (error) {
      console.error('Error fetching team data:', error)
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="h-4 w-4 text-yellow-500" />
      case "editor": return <Edit className="h-4 w-4 text-blue-500" />
      case "viewer": return <UserCheck className="h-4 w-4 text-green-500" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "default"
      case "editor": return "secondary"
      case "viewer": return "outline"
      default: return "outline"
    }
  }

  const handleRoleChange = async (memberId: string, newRole: "admin" | "editor" | "viewer") => {
    const member = members.find(m => m.id === memberId)
    if (!member) return

    try {
      // Update permissions based on role
      const permissions = {
        admin: {
          canCreateTags: true,
          canEditTags: true,
          canDeleteTags: true,
          canManageTeam: true,
          canViewAnalytics: true,
        },
        editor: {
          canCreateTags: true,
          canEditTags: true,
          canDeleteTags: false,
          canManageTeam: false,
          canViewAnalytics: true,
        },
        viewer: {
          canCreateTags: false,
          canEditTags: false,
          canDeleteTags: false,
          canManageTeam: false,
          canViewAnalytics: false,
        }
      }

      const { error } = await supabase
        .from('team_members')
        .update({ 
          role: newRole,
          permissions: permissions[newRole]
        })
        .eq('id', memberId)

      if (error) throw error

      setMembers(prev => prev.map(m => 
        m.id === memberId 
          ? { ...m, role: newRole, permissions: permissions[newRole] }
          : m
      ))

      toast({
        title: "Role Updated",
        description: `${member.name}'s role has been changed to ${newRole}`,
      })
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive"
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    if (!member) return

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setMembers(prev => prev.filter(m => m.id !== memberId))
      toast({
        title: "Member Removed",
        description: `${member.name} has been removed from the team`,
        variant: "destructive"
      })
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive"
      })
    }
  }

  const handleSaveSettings = async () => {
    if (!user) return

    try {
      // First try to update existing settings
      const { error: updateError } = await supabase
        .from('team_settings')
        .update({
          require_approval: settings.requireApproval,
          allow_public_tags: settings.allowPublicTags,
          auto_suggest_similar: settings.autoSuggestSimilar,
          enforce_naming_convention: settings.enforceNamingConvention,
          max_tags_per_user: settings.maxTagsPerUser,
          updated_at: new Date().toISOString()
        })

      if (updateError) {
        console.error('Error updating settings:', updateError)
        throw updateError
      }

      toast({
        title: "Settings Updated",
        description: "Team settings have been saved successfully",
      })

      setIsSettingsDialogOpen(false)
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save team settings",
        variant: "destructive"
      })
    }
  }

  const handleSendInvitation = async () => {
    if (!user || !inviteEmail.trim()) return

    try {
      // In a real app, this would send an actual invitation email
      // For now, we'll just show a success message
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail} with ${inviteRole} role`,
      })

      setInviteEmail("")
      setInviteRole("viewer")
      setIsInviteDialogOpen(false)
    } catch (error: any) {
      console.error('Error sending invitation:', error)
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      })
    }
  }

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Active now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return <div className="space-y-6">Loading team management...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Team Settings</DialogTitle>
                <DialogDescription>
                  Configure team-wide tag management settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Require Approval</Label>
                    <p className="text-xs text-muted-foreground">New tags need admin approval</p>
                  </div>
                  <Switch 
                    checked={settings.requireApproval}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({...prev, requireApproval: checked}))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Allow Public Tags</Label>
                    <p className="text-xs text-muted-foreground">Members can create public tags</p>
                  </div>
                  <Switch 
                    checked={settings.allowPublicTags}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({...prev, allowPublicTags: checked}))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Auto-suggest Similar</Label>
                    <p className="text-xs text-muted-foreground">Suggest existing similar tags</p>
                  </div>
                  <Switch 
                    checked={settings.autoSuggestSimilar}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({...prev, autoSuggestSimilar: checked}))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input 
                    id="inviteEmail" 
                    placeholder="colleague@company.com" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: "admin" | "editor" | "viewer") => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer - View only access</SelectItem>
                      <SelectItem value="editor">Editor - Can create and edit tags</SelectItem>
                      <SelectItem value="admin">Admin - Full access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSendInvitation} disabled={!inviteEmail.trim()}>
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{members.filter(m => m.role === "admin").length}</p>
              </div>
              <Crown className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Tags</p>
                <p className="text-2xl font-bold">{members.reduce((sum, m) => sum + m.tagStats.created, 0)}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">{members.reduce((sum, m) => sum + m.tagStats.used, 0)}</p>
              </div>
              <UserCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="editor">Editors</SelectItem>
                <SelectItem value="viewer">Viewers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage roles and permissions for your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tag Stats</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Created: <span className="font-medium text-foreground">{member.tagStats.created}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Used: <span className="font-medium text-foreground">{member.tagStats.used}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatLastActive(member.lastActive)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Select 
                        value={member.role} 
                        onValueChange={(value: "admin" | "editor" | "viewer") => 
                          handleRoleChange(member.id, value)
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}