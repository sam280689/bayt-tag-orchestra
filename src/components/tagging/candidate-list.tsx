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

// Mock data for candidates
const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Sarah Ahmed",
    email: "sarah.ahmed@email.com",
    phone: "+971 50 123 4567",
    position: "Senior Product Manager",
    location: "Dubai, UAE",
    experience: "8+ years",
    appliedDate: "2024-01-15",
    tags: ["Product Management", "Leadership", "Top Talent"],
  },
  {
    id: "2", 
    name: "Mohamed Ali",
    email: "mohamed.ali@email.com",
    phone: "+966 55 234 5678",
    position: "Full Stack Developer",
    location: "Riyadh, Saudi Arabia",
    experience: "5+ years",
    appliedDate: "2024-01-14",
    tags: ["React", "Node.js", "Remote Ready"],
  },
  {
    id: "3",
    name: "Fatima Hassan",
    email: "fatima.hassan@email.com", 
    phone: "+20 10 345 6789",
    position: "UX Designer",
    location: "Cairo, Egypt",
    experience: "6+ years",
    appliedDate: "2024-01-13",
    tags: ["Design Systems", "Figma Expert"],
  },
]

const mockSuggestions: TagSuggestion[] = [
  { value: "Top Talent", label: "Top Talent", type: "team", count: 45 },
  { value: "Leadership", label: "Leadership", type: "team", count: 32 },
  { value: "Remote Ready", label: "Remote Ready", type: "team", count: 28 },
  { value: "Product Management", label: "Product Management", type: "recent" },
  { value: "React", label: "React", type: "recent" },
  { value: "Figma Expert", label: "Figma Expert", type: "recent" },
  { value: "Arabic Speaker", label: "Arabic Speaker", type: "global", count: 156 },
  { value: "MBA", label: "MBA", type: "global", count: 89 },
]

export function CandidateList() {
  const [candidates, setCandidates] = React.useState(mockCandidates)
  const [selectedCandidates, setSelectedCandidates] = React.useState<string[]>([])
  const [bulkTags, setBulkTags] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterByTag, setFilterByTag] = React.useState<string>("")

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

  const handleBulkTagging = () => {
    if (selectedCandidates.length === 0 || bulkTags.length === 0) return

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

    setBulkTags([])
    setSelectedCandidates([])
  }

  const handleIndividualTagChange = (candidateId: string, newTags: string[]) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, tags: newTags }
        : candidate
    ))
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !searchQuery || 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTagFilter = !filterByTag || candidate.tags.includes(filterByTag)
    
    return matchesSearch && matchesTagFilter
  })

  const allTags = [...new Set(candidates.flatMap(c => c.tags))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">
            Manage and tag your candidate pipeline
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterByTag} onValueChange={setFilterByTag}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All candidates</SelectItem>
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
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {selectedCandidates.length} selected
              </Badge>
              <div className="flex-1">
                <TagInput
                  value={bulkTags}
                  onChange={setBulkTags}
                  suggestions={mockSuggestions}
                  placeholder="Add tags to selected candidates..."
                  maxTags={5}
                />
              </div>
              <Button onClick={handleBulkTagging} disabled={bulkTags.length === 0}>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{candidate.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{candidate.location}</span>
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
                        suggestions={mockSuggestions}
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