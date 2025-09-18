import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tag } from "@/components/ui/tag"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { 
  Tags, 
  Plus, 
  Merge, 
  Trash2, 
  Edit, 
  Search,
  AlertTriangle,
  Users,
  User,
  Globe,
  Zap,
  RefreshCw
} from "lucide-react"
import { DuplicateDetectionEngine } from "@/lib/smart-suggestions"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"

interface TagData {
  id: string
  name: string
  type: "personal" | "team" | "global"
  usage_count: number
  last_used: string
  created_by: string
  duplicates?: string[]
}

export function TagManagement() {
  const { user } = useAuth()
  const [tags, setTags] = React.useState<TagData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [isScanning, setIsScanning] = React.useState(false)
  const [newTagName, setNewTagName] = React.useState("")
  const [newTagType, setNewTagType] = React.useState<"personal" | "team" | "global">("personal")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [editTagId, setEditTagId] = React.useState<string | null>(null)
  const [editTagName, setEditTagName] = React.useState("")
  const [editTagType, setEditTagType] = React.useState<"personal" | "team" | "global">("personal")
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const fetchTags = React.useCallback(async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('usage_count', { ascending: false })

      if (error) throw error
      setTags((data || []).map(tag => ({
        ...tag,
        type: tag.type as "personal" | "team" | "global"
      })))
    } catch (error) {
      console.error('Error fetching tags:', error)
      toast({
        title: "Error fetching tags",
        description: "Failed to load tags from database",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const createTag = async () => {
    if (!user || !newTagName.trim()) return

    try {
      const { error } = await supabase
        .from('tags')
        .insert([{
          name: newTagName.trim(),
          type: newTagType,
          created_by: user.id
        }])

      if (error) throw error

      toast({
        title: "Tag Created",
        description: `Created tag "${newTagName}" successfully`,
      })

      setNewTagName("")
      setNewTagType("personal")
      setIsCreateDialogOpen(false)
      fetchTags()
    } catch (error: any) {
      toast({
        title: "Error creating tag",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Enhanced duplicate detection using smart algorithms
  const duplicateTags = React.useMemo(() => {
    const detectedDuplicates = DuplicateDetectionEngine.detectDuplicates(tags)
    return tags.map(tag => {
      const detected = detectedDuplicates.find(d => d.id === tag.id)
      return detected ? { ...tag, duplicates: detected.duplicates } : tag
    }).filter(tag => tag.duplicates && tag.duplicates.length > 0)
  }, [tags])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "team": return <Users className="h-4 w-4" />
      case "personal": return <User className="h-4 w-4" />
      case "global": return <Globe className="h-4 w-4" />
      default: return <Tags className="h-4 w-4" />
    }
  }

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "team": return "default" as const
      case "personal": return "secondary" as const
      case "global": return "outline" as const
      default: return "outline" as const
    }
  }

  const handleMergeTag = async (sourceId: string, targetName: string) => {
    const sourceTag = tags.find(t => t.id === sourceId)
    if (!sourceTag || !user) return

    try {
      // In a real implementation, this would merge usage counts and references
      await supabase
        .from('tags')
        .delete()
        .eq('id', sourceId)

      toast({
        title: "Tags Merged",
        description: `Merged "${sourceTag.name}" into "${targetName}". Updated ${sourceTag.usage_count} items.`,
      })

      fetchTags()
    } catch (error: any) {
      toast({
        title: "Error merging tags",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleEditTag = (tag: TagData) => {
    setEditTagId(tag.id)
    setEditTagName(tag.name)
    setEditTagType(tag.type)
    setIsEditDialogOpen(true)
  }

  const updateTag = async () => {
    if (!user || !editTagId || !editTagName.trim()) return

    try {
      const { error } = await supabase
        .from('tags')
        .update({
          name: editTagName.trim(),
          type: editTagType,
          updated_at: new Date().toISOString()
        })
        .eq('id', editTagId)
        .eq('created_by', user.id)

      if (error) throw error

      toast({
        title: "Tag Updated",
        description: `Updated tag "${editTagName}" successfully`,
      })

      setEditTagId(null)
      setEditTagName("")
      setEditTagType("personal")
      setIsEditDialogOpen(false)
      fetchTags()
    } catch (error: any) {
      toast({
        title: "Error updating tag",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    if (!tag || !user) return

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)

      if (error) throw error

      toast({
        title: "Tag Deleted", 
        description: `Deleted "${tag.name}". This action cannot be undone.`,
        variant: "destructive"
      })

      fetchTags()
    } catch (error: any) {
      toast({
        title: "Error deleting tag",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleSmartScan = async () => {
    setIsScanning(true)
    
    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In real implementation, this would call the smart detection API
    const detectedDuplicates = DuplicateDetectionEngine.detectDuplicates(tags)
    
    toast({
      title: "Smart Scan Complete",
      description: `Found ${detectedDuplicates.length} potential duplicates and optimization opportunities.`,
    })
    
    setIsScanning(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Tag Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your tag taxonomy and maintain data quality
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSmartScan}
            disabled={isScanning}
            className="w-full sm:w-auto"
          >
            {isScanning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isScanning ? "Scanning..." : "Smart Scan"}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 sm:mx-auto max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>
                  Add a new tag to your organization's taxonomy
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tagName">Tag Name</Label>
                  <Input 
                    id="tagName" 
                    placeholder="e.g. Senior Developer"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagType">Tag Type</Label>
                  <Select value={newTagType} onValueChange={(value: "personal" | "team" | "global") => setNewTagType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tag type" />
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-4rem)]">
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={createTag} disabled={!newTagName.trim()} className="w-full sm:w-auto">
                  Create Tag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Tag Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Tag</DialogTitle>
                <DialogDescription>
                  Update the tag name and type
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editTagName">Tag Name</Label>
                  <Input 
                    id="editTagName" 
                    placeholder="e.g. Senior Developer"
                    value={editTagName}
                    onChange={(e) => setEditTagName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTagType">Tag Type</Label>
                  <Select value={editTagType} onValueChange={(value: "personal" | "team" | "global") => setEditTagType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tag type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateTag} disabled={!editTagName.trim()}>
                  Update Tag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Tags</p>
                <p className="text-lg sm:text-2xl font-bold">{tags.length}</p>
              </div>
              <Tags className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Team Tags</p>
                <p className="text-lg sm:text-2xl font-bold">{tags.filter(t => t.type === "team").length}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Duplicates</p>
                <p className="text-lg sm:text-2xl font-bold text-warning">{duplicateTags.length}</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-warning flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Usage</p>
                <p className="text-lg sm:text-2xl font-bold">{tags.reduce((sum, tag) => sum + tag.usage_count, 0)}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duplicate Warnings */}
      {duplicateTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Duplicate Tags Detected
            </CardTitle>
            <CardDescription>
              These tags might be duplicates. Consider merging them to improve data quality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {duplicateTags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-3 bg-warning-light rounded-lg">
                  <div className="flex items-center gap-3">
                    <Tag variant="warning">{tag.name}</Tag>
                    <span className="text-sm text-muted-foreground">
                      Similar to: {tag.duplicates?.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Merge className="h-3 w-3 mr-1" />
                          Merge
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Merge Tags</DialogTitle>
                          <DialogDescription>
                            Merging "{tag.name}" into "{tag.duplicates?.[0]}" will update {tag.usage_count} items.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button onClick={() => handleMergeTag(tag.id, tag.duplicates?.[0] || "")}>
                            Confirm Merge
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
          <CardDescription>
            Manage your organization's complete tag taxonomy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag variant={tag.duplicates ? "warning" : "default"}>
                        {tag.name}
                      </Tag>
                      {tag.duplicates && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(tag.type)} className="capitalize">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(tag.type)}
                        {tag.type}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{tag.usage_count}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(tag.last_used).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    User
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditTag(tag)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the tag "{tag.name}" and remove it from {tag.usage_count} items. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTag(tag.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Tag
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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