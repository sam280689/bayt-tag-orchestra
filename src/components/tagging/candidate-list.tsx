import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tag } from "@/components/ui/tag"
import { TagInput, type TagSuggestion } from "@/components/ui/tag-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { 
  Search, 
  Filter, 
  Tags, 
  Users, 
  MapPin, 
  Calendar,
  Mail,
  Phone,
  Download
} from "lucide-react"

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  location: string
  experience: string
  appliedDate: string
  avatar?: string
  tags: string[]
  resume?: string
}


export function CandidateList() {
  const { user } = useAuth()
  const [candidates, setCandidates] = React.useState<Candidate[]>([])
  const [selectedCandidates, setSelectedCandidates] = React.useState<string[]>([])
  const [bulkTags, setBulkTags] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterByTag, setFilterByTag] = React.useState<string>("")
  const [loading, setLoading] = React.useState(true)
  const [tagSuggestions, setTagSuggestions] = React.useState<TagSuggestion[]>([])

  React.useEffect(() => {
    if (user) {
      fetchCandidates()
      fetchTagSuggestions()
    }
  }, [user])

  const fetchCandidates = async () => {
    try {
      // Fetch candidates with their tags
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })

      if (candidatesError) throw candidatesError

      // Fetch candidate tags
      const { data: candidateTagsData, error: tagsError } = await supabase
        .from('candidate_tags')
        .select('candidate_id, tags(name)')
        
      if (tagsError) throw tagsError

      // Group tags by candidate
      const candidateTagsMap: Record<string, string[]> = {}
      candidateTagsData?.forEach(ct => {
        if (!candidateTagsMap[ct.candidate_id]) {
          candidateTagsMap[ct.candidate_id] = []
        }
        if (ct.tags?.name) {
          candidateTagsMap[ct.candidate_id].push(ct.tags.name)
        }
      })

      // Transform candidates data
      const transformedCandidates: Candidate[] = candidatesData?.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.profile_text?.match(/(\+?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9})/)?.[0] || 'No phone',
        position: candidate.profile_text?.split('\n')[0] || 'Position not specified',
        location: candidate.profile_text?.match(/\b([A-Z][a-z]+,\s*[A-Z][a-z]+)\b/)?.[0] || 'Location not specified',
        experience: candidate.profile_text?.match(/(\d+\+?\s*years?)/i)?.[0] || 'Experience not specified',
        appliedDate: candidate.created_at.split('T')[0],
        tags: candidateTagsMap[candidate.id] || []
      })) || []

      setCandidates(transformedCandidates)
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

  const fetchTagSuggestions = async () => {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('name, type, usage_count')
        .order('usage_count', { ascending: false })

      if (error) throw error

      const suggestions: TagSuggestion[] = tags?.map(tag => ({
        value: tag.name,
        label: tag.name,
        type: tag.type === 'team' ? 'team' : tag.type === 'global' ? 'global' : 'recent',
        count: tag.usage_count
      })) || []

      setTagSuggestions(suggestions)
    } catch (error) {
      console.error('Error fetching tag suggestions:', error)
    }
  }

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates(prev => [...prev, candidateId])
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(filteredCandidates.map(c => c.id))
    } else {
      setSelectedCandidates([])
    }
  }

  const handleBulkTagging = async () => {
    if (selectedCandidates.length === 0 || bulkTags.length === 0 || !user) return

    try {
      // First ensure all tags exist
      for (const tagName of bulkTags) {
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single()

        if (!existingTag) {
          await supabase
            .from('tags')
            .insert({
              name: tagName,
              type: 'team',
              created_by: user.id
            })
        }
      }

      // Get tag IDs
      const { data: tagIds } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', bulkTags)

      if (tagIds) {
        // Create candidate_tags relationships
        const candidateTagInserts = []
        for (const candidateId of selectedCandidates) {
          for (const tag of tagIds) {
            candidateTagInserts.push({
              candidate_id: candidateId,
              tag_id: tag.id,
              created_by: user.id
            })
          }
        }

        await supabase
          .from('candidate_tags')
          .insert(candidateTagInserts)

        // Update local state
        setCandidates(prev => prev.map(candidate => {
          if (selectedCandidates.includes(candidate.id)) {
            const newTags = [...new Set([...candidate.tags, ...bulkTags])]
            return { ...candidate, tags: newTags }
          }
          return candidate
        }))

        toast({
          title: "Tags Applied",
          description: `Added ${bulkTags.join(", ")} to ${selectedCandidates.length} candidates`,
        })
      }
    } catch (error) {
      console.error('Error applying bulk tags:', error)
      toast({
        title: "Error",
        description: "Failed to apply tags",
        variant: "destructive"
      })
    }

    setBulkTags([])
    setSelectedCandidates([])
  }

  const handleIndividualTagChange = async (candidateId: string, newTags: string[]) => {
    if (!user) return

    try {
      // Remove existing tags for this candidate
      await supabase
        .from('candidate_tags')
        .delete()
        .eq('candidate_id', candidateId)

      // Add new tags
      if (newTags.length > 0) {
        // Ensure all tags exist
        for (const tagName of newTags) {
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single()

          if (!existingTag) {
            await supabase
              .from('tags')
              .insert({
                name: tagName,
                type: 'personal',
                created_by: user.id
              })
          }
        }

        // Get tag IDs and create relationships
        const { data: tagIds } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', newTags)

        if (tagIds) {
          const candidateTagInserts = tagIds.map(tag => ({
            candidate_id: candidateId,
            tag_id: tag.id,
            created_by: user.id
          }))

          await supabase
            .from('candidate_tags')
            .insert(candidateTagInserts)
        }
      }

      // Update local state
      setCandidates(prev => prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, tags: newTags }
          : candidate
      ))
    } catch (error) {
      console.error('Error updating candidate tags:', error)
      toast({
        title: "Error",
        description: "Failed to update tags",
        variant: "destructive"
      })
    }
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !searchQuery || 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTagFilter = !filterByTag || filterByTag === "all" || candidate.tags.includes(filterByTag)
    
    return matchesSearch && matchesTagFilter
  })

  const allTags = [...new Set(candidates.flatMap(c => c.tags))]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Candidates</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Loading candidates...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Candidates</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and tag your candidate pipeline
          </p>
        </div>
        <Button className="flex-shrink-0">
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-base"
              />
            </div>
            <Select value={filterByTag} onValueChange={setFilterByTag}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent className="max-w-[calc(100vw-2rem)]">
                <SelectItem value="all">All candidates</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCandidates.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Badge variant="secondary" className="self-start">
                {selectedCandidates.length} selected
              </Badge>
              <div className="flex-1 min-w-0">
                <TagInput
                  value={bulkTags}
                  onChange={setBulkTags}
                  suggestions={tagSuggestions}
                  placeholder="Add tags to selected candidates..."
                  maxTags={5}
                />
              </div>
              <Button 
                onClick={handleBulkTagging} 
                disabled={bulkTags.length === 0}
                className="w-full sm:w-auto"
              >
                <Tags className="h-4 w-4 mr-2" />
                Apply Tags
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {filteredCandidates.length} Candidates
            {filterByTag && (
              <Badge variant="outline">
                Tagged: {filterByTag}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-b border-border p-4">
            <Checkbox
              checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
              onCheckedChange={handleSelectAll}
              className="mr-2"
            />
            <span className="text-sm font-medium">Select All</span>
          </div>
          <div className="divide-y divide-border">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedCandidates.includes(candidate.id)}
                    onCheckedChange={(checked) => handleSelectCandidate(candidate.id, checked as boolean)}
                  />
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={candidate.avatar} />
                    <AvatarFallback>
                      {candidate.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{candidate.name}</h3>
                        <p className="text-primary font-medium">{candidate.position}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {candidate.experience}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 min-w-0">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{candidate.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 min-w-0 sm:col-span-2 lg:col-span-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{candidate.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Applied {new Date(candidate.appliedDate).toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Tags className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Tags</span>
                      </div>
                      <TagInput
                        value={candidate.tags}
                        onChange={(tags) => handleIndividualTagChange(candidate.id, tags)}
                        suggestions={tagSuggestions}
                        placeholder="Add tags..."
                        maxTags={8}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}