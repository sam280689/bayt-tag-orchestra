import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { 
  Tags, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Activity
} from "lucide-react"

interface DashboardData {
  topTags: Array<{
    id: string
    name: string
    type: string
    usage_count: number
    last_used: string
  }>
  recentActivity: Array<{
    created_at: string
    tagName: string
    tagType: string
  }>
  duplicateFlags: Array<{
    id: string
    name: string
    similarTo: string[]
    confidence: number
  }>
  stats: {
    totalTags: number
    totalCandidates: number
    totalTagApplications: number
  }
  tagsPerWeek: Array<{
    week: string
    count: number
    startDate: string
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function DashboardSimple() {
  const { user } = useAuth()
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const response = await supabase.functions.invoke('dashboard', {
        body: {}
      })

      if (response.error) throw response.error

      setData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="space-y-6">Loading dashboard...</div>
  }

  if (!data) {
    return <div className="space-y-6">No data available</div>
  }

  // Prepare chart data
  const tagTypeData = data.topTags.reduce((acc, tag) => {
    const existing = acc.find(item => item.type === tag.type)
    if (existing) {
      existing.count += 1
      existing.usage += tag.usage_count
    } else {
      acc.push({ type: tag.type, count: 1, usage: tag.usage_count })
    }
    return acc
  }, [] as Array<{ type: string; count: number; usage: number }>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your tagging system performance and usage
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalTags}</div>
            <p className="text-xs text-muted-foreground">
              Active tags in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              Candidates in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tag Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalTagApplications}</div>
            <p className="text-xs text-muted-foreground">
              Total tag usages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicates Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.duplicateFlags.length}</div>
            <p className="text-xs text-muted-foreground">
              Potential duplicates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tags Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Tags by Usage</CardTitle>
            <CardDescription>Most frequently used tags</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topTags.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage_count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tag Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tag Types Distribution</CardTitle>
            <CardDescription>Breakdown by tag type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tagTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type} (${count})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {tagTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tags Created Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Tags Created Over Time</CardTitle>
          <CardDescription>Tag creation trend (last 4 weeks)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.tagsPerWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity and Duplicates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Tag Activity
            </CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      activity.tagType === 'global' ? 'default' :
                      activity.tagType === 'team' ? 'secondary' : 'outline'
                    }>
                      {activity.tagName}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {activity.tagType}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {data.recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Duplicate Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Duplicate Flags
            </CardTitle>
            <CardDescription>Potential tag duplicates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.duplicateFlags.slice(0, 10).map((duplicate, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{duplicate.name}</span>
                    <Badge variant={duplicate.confidence > 0.8 ? 'destructive' : 'secondary'}>
                      {Math.round(duplicate.confidence * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Similar to: {duplicate.similarTo.join(', ')}
                  </p>
                </div>
              ))}
              {data.duplicateFlags.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No duplicates detected
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}