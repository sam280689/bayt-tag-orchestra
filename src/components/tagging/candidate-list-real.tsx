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
import { Search, Download, Tag, Users, CheckCircle2, FileSpreadsheet, FileText } from "lucide-react"
import { exportToExcel, exportToPDF, type ExportCandidate } from "@/lib/export-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDebounce } from "@/hooks/useDebounce"

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
  
  // Debounce search query to improve UX
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  React.useEffect(() => {
    if (user) {
      fetchCandidates()
      fetchAvailableTags()
    }
  }, [user])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      console.log('Fetching candidates with search:', debouncedSearchQuery, 'and tag filter:', tagFilter);
      
      // Use direct database query to get candidates with their tags
      let query = supabase
        .from('candidates')
        .select(`
          *,
          candidate_tags (
            id,
            tag_id,
            created_at,
            tags (
              id,
              name,
              type
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (debouncedSearchQuery) {
        query = query.or(`name.ilike.%${debouncedSearchQuery}%,email.ilike.%${debouncedSearchQuery}%,profile_text.ilike.%${debouncedSearchQuery}%`);
      }

      const { data: candidatesData, error } = await query;

      if (error) {
        console.error('Error fetching candidates:', error);
        setCandidates([]);
        return;
      }

      console.log('Raw candidates data:', candidatesData);

      // Transform the data to match expected format
      const transformedCandidates = (candidatesData || []).map(candidate => ({
        ...candidate,
        tags: candidate.candidate_tags?.map((ct: any) => ({
          id: ct.tags?.id,
          name: ct.tags?.name,
          type: ct.tags?.type
        })) || []
      }));

      console.log('Transformed candidates:', transformedCandidates);
      setCandidates(transformedCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error)
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableTags = async () => {
    try {
      console.log('Fetching available tags...');
      
      // First try direct query to tags table
      const { data: tags, error } = await supabase
        .from('tags')
        .select('*')
        .order('usage_count', { ascending: false });
      
      if (error) {
        console.error('Error fetching tags from database:', error);
        setAvailableTags([]);
        return;
      }

      console.log('Tags data from database:', tags);
      
      const tagOptions = (tags || []).map((tag: any) => ({
        value: tag.name,
        label: tag.name,
        type: tag.type,
        count: tag.usage_count || 0
      }));
      
      setAvailableTags(tagOptions);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setAvailableTags([]);
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
      const tagIds = []
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('No authentication session available');
      }

      // Create new tags and get their IDs, or find existing tag IDs
      for (const tagName of bulkTags) {
        // First check if tag exists
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle();

        if (existingTag) {
          tagIds.push(existingTag.id);
        } else {
          // Create new tag directly in database
          const { data: newTag, error } = await supabase
            .from('tags')
            .insert({
              name: tagName,
              type: 'personal',
              created_by: session.data.session.user.id,
              usage_count: 0
            })
            .select('id')
            .single();
            
          if (error) {
            console.error('Error creating tag:', error);
          } else if (newTag) {
            tagIds.push(newTag.id);
          }
        }
      }

      if (tagIds.length === 0) {
        throw new Error('No valid tag IDs found');
      }

      // Create all candidate_tag combinations
      const candidateTagInserts = []
      for (const candidateId of selectedCandidates) {
        for (const tagId of tagIds) {
          candidateTagInserts.push({
            candidate_id: candidateId,
            tag_id: tagId,
            created_by: session.data.session.user.id
          })
        }
      }

      // Insert all candidate_tag relationships (ignore duplicates)
      const { error: insertError } = await supabase
        .from('candidate_tags')
        .upsert(candidateTagInserts, { 
          onConflict: 'candidate_id,tag_id',
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error('Error bulk inserting candidate tags:', insertError);
        throw insertError;
      }

      // Update usage counts for all affected tags
      for (const tagId of tagIds) {
        await supabase.rpc('increment_tag_usage', { tag_id: tagId });
      }

      toast({
        title: "Bulk Tagging Complete",
        description: `Applied ${bulkTags.length} tags to ${selectedCandidates.length} candidates`,
      })

      setShowBulkDialog(false)
      setBulkTags([])
      setSelectedCandidates([])
      fetchCandidates() // Refresh candidates
      fetchAvailableTags() // Refresh available tags
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
      // Get current candidate tags to determine which to add/remove
      const candidate = candidates.find(c => c.id === candidateId);
      if (!candidate) return;

      const currentTagNames = candidate.tags.map(t => t.name);
      const tagsToAdd = tags.filter(tag => !currentTagNames.includes(tag));
      const tagsToRemove = currentTagNames.filter(tag => !tags.includes(tag));

      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('No authentication session available');
      }

      // Add new tags
      for (const tagName of tagsToAdd) {
        let tagId: string | undefined;
        
        // First check if tag exists
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle();
          
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          // Create new tag
          const { data: newTag, error } = await supabase
            .from('tags')
            .insert({
              name: tagName,
              type: 'personal',
              created_by: session.data.session.user.id,
              usage_count: 0
            })
            .select('id')
            .single();
            
          if (error) {
            console.error('Error creating tag:', error);
          } else if (newTag) {
            tagId = newTag.id;
            // Refresh available tags
            await fetchAvailableTags();
          }
        }

        if (tagId) {
          // Add candidate_tag relationship
          const { error } = await supabase
            .from('candidate_tags')
            .insert({
              candidate_id: candidateId,
              tag_id: tagId,
              created_by: session.data.session.user.id
            });
            
          if (error && error.code !== '23505') { // Ignore duplicate key errors
            console.error('Error adding tag to candidate:', error);
          } else {
            // Increment tag usage
            await supabase.rpc('increment_tag_usage', { tag_id: tagId });
          }
        }
      }

      // Remove tags
      for (const tagName of tagsToRemove) {
        const { data: tagData } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle();
          
        if (tagData?.id) {
          const { error } = await supabase
            .from('candidate_tags')
            .delete()
            .eq('candidate_id', candidateId)
            .eq('tag_id', tagData.id)
            .eq('created_by', session.data.session.user.id);
            
          if (error) {
            console.error('Error removing tag from candidate:', error);
          } else {
            // Decrement tag usage
            await supabase.rpc('decrement_tag_usage', { tag_id: tagData.id });
          }
        }
      }

      toast({
        title: "Tags Updated",
        description: `Updated tags for ${candidate.name}`,
      });

      // Refresh candidates to show updated tags
      await fetchCandidates();
      await fetchAvailableTags(); // Refresh available tags to update counts
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
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('No authentication session available');
      }

      // Try direct database insert first
      const { data: tag, error } = await supabase
        .from('tags')
        .insert({
          name: tagName,
          type: 'personal',
          created_by: session.data.session.user.id,
          usage_count: 0
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Tag already exists, that's ok
          console.log('Tag already exists:', tagName);
        } else {
          console.error('Error creating tag:', error);
          throw error;
        }
      }

      // Refresh available tags
      await fetchAvailableTags()
      
      return tagName
    } catch (error) {
      console.error('Error creating tag:', error)
      toast({
        title: "Error",
        description: "Failed to create tag. Please try again.",
        variant: "destructive"
      });
      throw error
    }
  }

  const handleExport = (format: 'excel' | 'pdf') => {
    const candidatesToExport = selectedCandidates.length > 0 
      ? filteredCandidates.filter(c => selectedCandidates.includes(c.id))
      : filteredCandidates;

    if (candidatesToExport.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No candidates to export",
        variant: "destructive"
      });
      return;
    }

    const exportData: ExportCandidate[] = candidatesToExport.map(candidate => ({
      name: candidate.name,
      email: candidate.email,
      profile_text: candidate.profile_text,
      created_at: candidate.created_at,
      tags: candidate.tags.map(t => t.name).join(', ')
    }));

    const filename = `candidates_${new Date().toISOString().split('T')[0]}`;
    
    try {
      if (format === 'excel') {
        exportToExcel(exportData, filename);
      } else {
        exportToPDF(exportData, filename);
      }

      toast({
        title: "Export Successful",
        description: `Exported ${exportData.length} candidates to ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export candidates",
        variant: "destructive"
      });
    }
  }

  // Filter candidates based on search and tag filter
  const filteredCandidates = React.useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = !debouncedSearchQuery || 
        candidate.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (candidate.profile_text && candidate.profile_text.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))

      const matchesTagFilter = !tagFilter || tagFilter === "all" || 
        candidate.tags.some(tag => tag.name === tagFilter)

      return matchesSearch && matchesTagFilter
    })
  }, [candidates, debouncedSearchQuery, tagFilter])

  React.useEffect(() => {
    fetchCandidates()
  }, [debouncedSearchQuery, tagFilter])

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export {selectedCandidates.length > 0 ? 'Selected' : 'All'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Export to PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                <SelectItem value="all">All candidates</SelectItem>
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
                  {debouncedSearchQuery || tagFilter 
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