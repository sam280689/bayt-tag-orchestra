import * as React from "react"
import { useLocation } from "react-router-dom"
import { CandidateList } from '@/components/tagging/candidate-list';
import { AnalyticsDashboard } from '@/components/tagging/analytics-dashboard';
import { TagManagement } from '@/components/tagging/tag-management';
import { PersonalTags } from '@/components/tagging/personal-tags';
import { MainNav } from '@/components/navigation/main-nav';
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
      case "/":
        return <PersonalTags />
      default:
        return <PersonalTags />
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
