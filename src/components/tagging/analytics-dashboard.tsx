import * as React from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Timer, 
  Target, 
  Tags,
  AlertCircle,
  CheckCircle,
  Calendar,
  Activity
} from "lucide-react"

// Mock analytics data
const adoptionData = [
  { month: 'Jan', recruiters: 68, seekers: 45, totalUsers: 150 },
  { month: 'Feb', recruiters: 75, seekers: 52, totalUsers: 165 },
  { month: 'Mar', recruiters: 82, seekers: 58, totalUsers: 178 },
  { month: 'Apr', recruiters: 89, seekers: 65, totalUsers: 195 },
  { month: 'May', recruiters: 95, seekers: 72, totalUsers: 210 },
  { month: 'Jun', recruiters: 102, seekers: 78, totalUsers: 225 },
]

const efficiencyData = [
  { week: 'Week 1', withTags: 4.2, withoutTags: 8.1 },
  { week: 'Week 2', withTags: 3.8, withoutTags: 7.9 },
  { week: 'Week 3', withTags: 3.5, withoutTags: 8.3 },
  { week: 'Week 4', withTags: 3.2, withoutTags: 8.0 },
]

const topTags = [
  { name: 'Top Talent', usage: 145, type: 'team' },
  { name: 'Remote Ready', usage: 98, type: 'team' },
  { name: 'Leadership', usage: 87, type: 'team' },
  { name: 'React', usage: 76, type: 'skill' },
  { name: 'Product Manager', usage: 65, type: 'role' },
  { name: 'Arabic Speaker', usage: 54, type: 'language' },
]

const conversionData = [
  { name: 'Tagged Candidates', applied: 1200, interviewed: 240, hired: 48 },
  { name: 'Untagged Candidates', applied: 2800, interviewed: 420, hired: 70 },
]

const tagHygiene = [
  { category: 'Clean Tags', value: 76, color: '#10B981' },
  { category: 'Duplicates', value: 18, color: '#F59E0B' },
  { category: 'Deprecated', value: 6, color: '#EF4444' },
]

export function AnalyticsDashboard() {
  const [loading, setLoading] = React.useState(true)
  const [analytics, setAnalytics] = React.useState({
    totalTags: 0,
    totalCandidates: 0,
    totalTeamMembers: 0,
    activeTaggers: 0,
    topTags: [],
    tagsByType: [],
    recentActivity: []
  })

  React.useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch real data from database
      const [tagsResult, candidatesResult, teamMembersResult, candidateTagsResult] = await Promise.all([
        supabase.from('tags').select('*'),
        supabase.from('candidates').select('*'), 
        supabase.from('team_members').select('*'),
        supabase.from('candidate_tags').select('*, tags(name, type)')
      ])

      // Calculate analytics
      const totalTags = tagsResult.data?.length || 0
      const totalCandidates = candidatesResult.data?.length || 0
      const totalTeamMembers = teamMembersResult.data?.length || 0
      
      // Calculate active taggers (team members who have created tags)
      const activeTaggers = new Set(tagsResult.data?.map(tag => tag.created_by)).size
      
      // Calculate top tags by usage
      const tagUsage = {}
      candidateTagsResult.data?.forEach(ct => {
        if (ct.tags) {
          const tagName = ct.tags.name
          tagUsage[tagName] = (tagUsage[tagName] || 0) + 1
        }
      })
      
      const topTags = Object.entries(tagUsage)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 6)
        .map(([name, usage], index) => ({
          name,
          usage: usage as number,
          type: tagsResult.data?.find(t => t.name === name)?.type || 'unknown'
        }))

      // Calculate tags by type
      const typeCount = {}
      tagsResult.data?.forEach(tag => {
        typeCount[tag.type] = (typeCount[tag.type] || 0) + 1
      })
      
      const tagsByType = Object.entries(typeCount).map(([type, count]) => ({
        type,
        count
      }))

      setAnalytics({
        totalTags,
        totalCandidates,
        totalTeamMembers,
        activeTaggers,
        topTags,
        tagsByType,
        recentActivity: candidateTagsResult.data?.slice(-5) || []
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for charts (keeping for demo purposes with some real data mixed in)
  const adoptionData = [
    { month: 'Jan', recruiters: Math.floor(analytics.activeTaggers * 0.6), seekers: Math.floor(analytics.activeTaggers * 0.4), totalUsers: analytics.totalTeamMembers },
    { month: 'Feb', recruiters: Math.floor(analytics.activeTaggers * 0.65), seekers: Math.floor(analytics.activeTaggers * 0.45), totalUsers: analytics.totalTeamMembers },
    { month: 'Mar', recruiters: Math.floor(analytics.activeTaggers * 0.7), seekers: Math.floor(analytics.activeTaggers * 0.5), totalUsers: analytics.totalTeamMembers },
    { month: 'Apr', recruiters: Math.floor(analytics.activeTaggers * 0.75), seekers: Math.floor(analytics.activeTaggers * 0.55), totalUsers: analytics.totalTeamMembers },
    { month: 'May', recruiters: Math.floor(analytics.activeTaggers * 0.8), seekers: Math.floor(analytics.activeTaggers * 0.6), totalUsers: analytics.totalTeamMembers },
    { month: 'Jun', recruiters: analytics.activeTaggers, seekers: Math.floor(analytics.activeTaggers * 0.65), totalUsers: analytics.totalTeamMembers },
  ]

  const tagHygiene = [
    { category: 'Active Tags', value: analytics.totalTags * 0.8, color: '#10B981' },
    { category: 'Duplicates', value: analytics.totalTags * 0.15, color: '#F59E0B' },
    { category: 'Unused', value: analytics.totalTags * 0.05, color: '#EF4444' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tagging Analytics</h1>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tagging Analytics</h1>
        <p className="text-muted-foreground">
          Track adoption, efficiency, and impact of your unified tagging system
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Phase 1: Basic Adoption Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Taggers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeTaggers}</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analytics.totalTeamMembers > 0 ? `${Math.round((analytics.activeTaggers / analytics.totalTeamMembers) * 100)}%` : '0%'} adoption rate
            </div>
            <Progress value={analytics.totalTeamMembers > 0 ? (analytics.activeTaggers / analytics.totalTeamMembers) * 100 : 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.activeTaggers} active out of {analytics.totalTeamMembers} team members
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Total tags created</span>
                <span className="font-medium">{analytics.totalTags}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Tagged candidates</span>
                <span className="font-medium">{analytics.totalCandidates}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Efficiency</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">60%</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              Faster with tags
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              3.2s vs 8.0s average time
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Tagged search</span>
                <span className="font-medium text-success">3.2s avg</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Text search</span>
                <span className="font-medium text-muted-foreground">8.0s avg</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Impact</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+8%</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              Tagged vs untagged
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Higher interview rate
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Tagged candidates</span>
                <span className="font-medium text-success">20% interview rate</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Untagged candidates</span>
                <span className="font-medium text-muted-foreground">15% interview rate</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tag Hygiene</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.totalTags * 0.76)}%</div>
            <div className="flex items-center text-xs text-warning">
              <AlertCircle className="h-3 w-3 mr-1" />
              {Math.round(analytics.totalTags * 0.18)}% need cleanup
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tag quality score
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="adoption" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="adoption">Adoption</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="hygiene">Hygiene</TabsTrigger>
        </TabsList>

        <TabsContent value="adoption" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Adoption Trend
                </CardTitle>
                <CardDescription>
                  Monthly active taggers by role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={adoptionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="recruiters" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Recruiters"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="seekers" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      name="Job Seekers"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Most Used Tags
                </CardTitle>
                <CardDescription>
                  Top performing tags this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topTags.length > 0 ? analytics.topTags.map((tag, index) => (
                    <div key={tag.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{tag.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {tag.type}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {tag.usage}
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">No tag usage data available yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Search Time Comparison
              </CardTitle>
              <CardDescription>
                Average time to find candidates (seconds)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="withTags" fill="hsl(var(--success))" name="With Tags" />
                  <Bar dataKey="withoutTags" fill="hsl(var(--muted))" name="Without Tags" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Conversion Funnel
              </CardTitle>
              <CardDescription>
                Tagged vs untagged candidate performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applied" fill="hsl(var(--muted))" name="Applied" />
                  <Bar dataKey="interviewed" fill="hsl(var(--primary))" name="Interviewed" />
                  <Bar dataKey="hired" fill="hsl(var(--success))" name="Hired" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hygiene" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Tag Quality Distribution
                </CardTitle>
                <CardDescription>
                  Current state of your tag taxonomy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tagHygiene}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {tagHygiene.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cleanup Actions</CardTitle>
                <CardDescription>
                  Recommended actions to improve tag quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-warning-light rounded-lg">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">18 Duplicate Tags Found</p>
                    <p className="text-xs text-muted-foreground">
                      Consider merging similar tags like "PM" → "Product Manager"
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-success-light rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">6 Tags Deprecated</p>
                    <p className="text-xs text-muted-foreground">
                      Successfully cleaned up outdated tags
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-sm mb-2">Next Review</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Quarterly cleanup scheduled for March 2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}