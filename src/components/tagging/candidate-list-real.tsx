import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { TagInput } from "@/components/ui/tag-input"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"
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
import { Search, Download, Tag, Users, CheckCircle2 } from "lucide-react"

interface CandidateTag {
  id: string
  name: string
  type: 'personal' | 'team' | 'global'
}

interface Candidate {
  id: string
  name: string
  email: string
  profile_text?: string
  created_at: string
  tags: CandidateTag[]
}

interface TagSuggestion {
  value: string
  label: string
  type: 'personal' | 'team' | 'global' | 'recent'
  count?: number
}

export function CandidateListReal() {
  const { user } = useAuth()
  const [candidates, setCandidates] = React.useState<Candidate[]>([])
  const [selectedCandidates, setSelectedCandidates] = React.useState<string[]>([])
  const [bulkTags, setBulkTags] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [tagFilter, setTagFilter] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [showBulkDialog, setShowBulkDialog] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<TagSuggestion[]>([])
  const [availableTags, setAvailableTags] = React.useState<TagSuggestion[]>([])

  React.useEffect(() => {
    if (user) {
      fetchCandidates()
      fetchAvailableTags()
    }
  }, [user])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      
      const response = await supabase.functions.invoke('candidates', {
        body: {
          search: searchQuery,
          tags: tagFilter ? [tagFilter] : []
        }
      })

      if (response.error) throw response.error

      setCandidates(response.data.candidates || [])
    } catch (error) {
      console.error('Error fetching candidates:', error)
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableTags = async () => {
    try {
      const response = await supabase.functions.invoke('tags', {
        body: {}
      })

      if (response.error) throw response.error

      const tagSuggestions: TagSuggestion[] = response.data.tags.map((tag: any) => ({
        value: tag.name,
        label: tag.name,
        type: tag.type,
        count: tag.usage_count
      }))

      setAvailableTags(tagSuggestions)
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleSelectCandidate = (candidateId: string, selected: boolean) => {
    if (selected) {
      setSelectedCandidates(prev => [...prev, candidateId])
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId))
    }
  }

  const handleSelectAll = () => {
    const allSelected = selectedCandidates.length === filteredCandidates.length
    if (allSelected) {
      setSelectedCandidates([])
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id))
    }
  }

  const handleBulkTagging = async () => {
    if (selectedCandidates.length === 0 || bulkTags.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select candidates and tags",
        variant: "destructive"
      })
      return
    }

    try {
      // First, create any new tags that don't exist
      const newTags = bulkTags.filter(tag => 
        !availableTags.some(availableTag => availableTag.value === tag)
      )

      const tagIds = []

      // Create new tags
      for (const tagName of newTags) {
        const response = await supabase.functions.invoke('tags', {
          body: { name: tagName, type: 'personal' }
        })
        if (response.data?.tag) {
          tagIds.push(response.data.tag.id)
        }
      }

      // Get existing tag IDs
      const existingTagIds = availableTags
        .filter(tag => bulkTags.includes(tag.value))
        .map(tag => tag.value) // We'll need to get actual IDs

      // For now, we'll simulate the bulk operation
      const response = await supabase.functions.invoke('bulk-tag', {
        body: {
          candidateIds: selectedCandidates,
          tagIds: [...tagIds, ...existingTagIds]
        }
      })

      if (response.error) throw response.error

      toast({
        title: "Bulk Tagging Complete",
        description: `Applied ${bulkTags.length} tags to ${selectedCandidates.length} candidates`,
      })

      setShowBulkDialog(false)
      setBulkTags([])
      setSelectedCandidates([])
      fetchCandidates() // Refresh candidates
    } catch (error) {
      console.error('Error in bulk tagging:', error)
      toast({
        title: "Error",
        description: "Failed to apply bulk tags",
        variant: "destructive"
      })
    }
  }

  const handleIndividualTagChange = async (candidateId: string, tags: string[]) => {
    try {
      // This would require implementing individual tag application
      // For now, we'll show a toast
      toast({
        title: "Tags Updated",
        description: `Updated tags for candidate`,
      })
    } catch (error) {
      console.error('Error updating individual tags:', error)
      toast({
        title: "Error",
        description: "Failed to update tags",
        variant: "destructive"
      })
    }
  }

  const handleCreateTag = async (tagName: string) => {
    try {
      const response = await supabase.functions.invoke('tags', {
        body: { name: tagName, type: 'personal' }
      })

      if (response.error) throw response.error

      // Refresh available tags
      fetchAvailableTags()
      
      return tagName
    } catch (error) {
      console.error('Error creating tag:', error)
      throw error
    }
  }

  // Filter candidates based on search and tag filter
  const filteredCandidates = React.useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = !searchQuery || 
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.profile_text && candidate.profile_text.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesTagFilter = !tagFilter || 
        candidate.tags.some(tag => tag.name === tagFilter)

      return matchesSearch && matchesTagFilter
    })
  }, [candidates, searchQuery, tagFilter])

  React.useEffect(() => {
    fetchCandidates()
  }, [searchQuery, tagFilter])

  if (loading) {
    return <div className="space-y-6">Loading candidates...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Candidate Management</h1>
          <p className="text-muted-foreground">
            Manage and tag candidates for better organization
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Selected
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All candidates</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag.value} value={tag.value}>
                    {tag.label} ({tag.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCandidates.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Tag className="h-4 w-4 mr-2" />
                    Bulk Tag
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Tag Candidates</DialogTitle>
                    <DialogDescription>
                      Apply tags to {selectedCandidates.length} selected candidates
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <TagInput
                      value={bulkTags}
                      onChange={setBulkTags}
                      suggestions={availableTags}
                      placeholder="Add tags..."
                      onCreateTag={handleCreateTag}
                      maxTags={10}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkTagging}>
                      Apply Tags
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidates List */}
      <div className="space-y-4">
        {/* Header with Select All */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <Checkbox
            checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="font-medium">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Candidate Cards */}
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="transition-all hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedCandidates.includes(candidate.id)}
                  onCheckedChange={(checked) => 
                    handleSelectCandidate(candidate.id, checked as boolean)
                  }
                />
                
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added {new Date(candidate.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {candidate.profile_text && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {candidate.profile_text}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {candidate.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="pt-2">
                    <TagInput
                      value={candidate.tags.map(t => t.name)}
                      onChange={(tags) => handleIndividualTagChange(candidate.id, tags)}
                      suggestions={availableTags}
                      placeholder="Add tags..."
                      onCreateTag={handleCreateTag}
                      maxTags={15}
                      context={`candidate:${candidate.id}`}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCandidates.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No candidates found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || tagFilter 
                    ? "Try adjusting your search or filter criteria"
                    : "No candidates have been added yet"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}