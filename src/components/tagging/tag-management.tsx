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

interface TagData {
  id: string
  name: string
  type: "personal" | "team" | "global"
  usage: number
  lastUsed: string
  createdBy: string
  duplicates?: string[]
}

// Mock tag data
const mockTags: TagData[] = [
  {
    id: "1",
    name: "Top Talent",
    type: "team",
    usage: 145,
    lastUsed: "2024-01-20",
    createdBy: "Sarah Ahmed"
  },
  {
    id: "2",
    name: "Remote Ready", 
    type: "team",
    usage: 98,
    lastUsed: "2024-01-19",
    createdBy: "Ahmed Ali"
  },
  {
    id: "3",
    name: "Leadership",
    type: "team", 
    usage: 87,
    lastUsed: "2024-01-18",
    createdBy: "Fatima Hassan"
  },
  {
    id: "4",
    name: "React Developer",
    type: "personal",
    usage: 23,
    lastUsed: "2024-01-15",
    createdBy: "You"
  },
  {
    id: "5",
    name: "Product Manager",
    type: "global",
    usage: 234,
    lastUsed: "2024-01-20",
    createdBy: "System"
  },
  {
    id: "6", 
    name: "PM",
    type: "team",
    usage: 45,
    lastUsed: "2024-01-10",
    createdBy: "John Doe",
    duplicates: ["Product Manager"]
  }
]

export function TagManagement() {
  const [tags, setTags] = React.useState(mockTags)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [isScanning, setIsScanning] = React.useState(false)

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
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
      case "team": return "default"
      case "personal": return "secondary" 
      case "global": return "outline"
      default: return "outline"
    }
  }

  const handleMergeTag = (sourceId: string, targetName: string) => {
    const sourceTag = tags.find(t => t.id === sourceId)
    if (!sourceTag) return

    // In a real app, this would call an API
    toast({
      title: "Tags Merged",
      description: `Merged "${sourceTag.name}" into "${targetName}". Updated ${sourceTag.usage} items.`,
    })

    // Remove the source tag from our local state
    setTags(prev => prev.filter(t => t.id !== sourceId))
  }

  const handleDeleteTag = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    if (!tag) return

    toast({
      title: "Tag Deleted", 
      description: `Deleted "${tag.name}". This action cannot be undone.`,
      variant: "destructive"
    })

    setTags(prev => prev.filter(t => t.id !== tagId))
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tag Management</h1>
          <p className="text-muted-foreground">
            Manage your tag taxonomy and maintain data quality
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSmartScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isScanning ? "Scanning..." : "Smart Scan"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>
                Add a new tag to your organization's taxonomy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tagName">Tag Name</Label>
                <Input id="tagName" placeholder="e.g. Senior Developer" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create Tag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tags</p>
                <p className="text-2xl font-bold">{tags.length}</p>
              </div>
              <Tags className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Tags</p>
                <p className="text-2xl font-bold">{tags.filter(t => t.type === "team").length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duplicates</p>
                <p className="text-2xl font-bold text-warning">{duplicateTags.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">{tags.reduce((sum, tag) => sum + tag.usage, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
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
                            Merging "{tag.name}" into "{tag.duplicates?.[0]}" will update {tag.usage} items.
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
                    <Badge variant="secondary">{tag.usage}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(tag.lastUsed).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tag.createdBy}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
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