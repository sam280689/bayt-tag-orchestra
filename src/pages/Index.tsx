import * as React from "react"
import { useLocation } from "react-router-dom"
import { MainNav } from "@/components/navigation/main-nav"
import { CandidateList } from "@/components/tagging/candidate-list"
import { AnalyticsDashboard } from "@/components/tagging/analytics-dashboard"
import { TagManagement } from "@/components/tagging/tag-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TagInput, type TagSuggestion } from "@/components/ui/tag-input"
import { 
  Users, 
  BarChart3, 
  Tags,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react"

// Mock suggestions for the homepage demo
const mockSuggestions: TagSuggestion[] = [
  { value: "Top Talent", label: "Top Talent", type: "team", count: 45 },
  { value: "Remote Ready", label: "Remote Ready", type: "team", count: 28 },
  { value: "Leadership", label: "Leadership", type: "team", count: 32 },
  { value: "Product Management", label: "Product Management", type: "recent" },
  { value: "React", label: "React", type: "recent" },
  { value: "Arabic Speaker", label: "Arabic Speaker", type: "global", count: 156 },
]

const Index = () => {
  const location = useLocation()
  const [demoTags, setDemoTags] = React.useState<string[]>(["Product Manager", "Senior Level"])

  // Route-based content rendering
  const renderContent = () => {
    switch (location.pathname) {
      case "/candidates":
        return <CandidateList />
      case "/analytics":
        return <AnalyticsDashboard />
      case "/tags":
        return <TagManagement />
      default:
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-12">
              <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Tags className="h-4 w-4" />
                Unified Tagging System
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Organize Your Talent Pipeline with Smart Tagging
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Streamline candidate management, improve team collaboration, and make data-driven hiring decisions with Bayt's intelligent tagging system.
              </p>
              
              {/* Interactive Demo */}
              <div className="max-w-lg mx-auto mt-8">
                <div className="text-left space-y-2">
                  <label className="text-sm font-medium">Try tagging candidates:</label>
                  <TagInput
                    value={demoTags}
                    onChange={setDemoTags}
                    suggestions={mockSuggestions}
                    placeholder="Add tags like 'Senior Developer' or 'Remote Ready'..."
                    maxTags={5}
                  />
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Users className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  <CardTitle>Candidate Management</CardTitle>
                  <CardDescription>
                    Tag and organize candidates with team collaboration features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Bulk tagging workflows
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Smart suggestions
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Team collaboration
                    </div>
                    <Button className="w-full mt-4" asChild>
                      <a href="/candidates">
                        View Candidates
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <BarChart3 className="h-8 w-8 text-accent" />
                    <Badge variant="secondary">Analytics</Badge>
                  </div>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>
                    Track adoption, efficiency, and hiring impact metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-success" />
                      42% active taggers
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-accent" />
                      60% faster searches
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success" />
                      +8% conversion lift
                    </div>
                    <Button variant="outline" className="w-full mt-4" asChild>
                      <a href="/analytics">
                        View Analytics
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Tags className="h-8 w-8 text-warning" />
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  <CardTitle>Tag Governance</CardTitle>
                  <CardDescription>
                    Maintain clean taxonomies with duplicate detection and merging
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm opacity-60">
                      <CheckCircle className="h-4 w-4" />
                      Duplicate detection
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-60">
                      <CheckCircle className="h-4 w-4" />
                      Tag merging
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-60">
                      <CheckCircle className="h-4 w-4" />
                      Synonym mapping
                    </div>
                    <Button variant="secondary" disabled className="w-full mt-4">
                      Coming in Phase 2
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">102</div>
                    <div className="text-sm text-muted-foreground">Active Recruiters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">78</div>
                    <div className="text-sm text-muted-foreground">Active Seekers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">245</div>
                    <div className="text-sm text-muted-foreground">Total Tags</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">76%</div>
                    <div className="text-sm text-muted-foreground">Tag Quality</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  )
}

export default Index
