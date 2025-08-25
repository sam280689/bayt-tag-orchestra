import * as React from "react"
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Taggers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
            <Progress value={42} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              102 recruiters, 78 seekers
            </p>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tag Hygiene</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76%</div>
            <div className="flex items-center text-xs text-warning">
              <AlertCircle className="h-3 w-3 mr-1" />
              18% need cleanup
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Canonical usage rate
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
                  {topTags.map((tag, index) => (
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
                  ))}
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