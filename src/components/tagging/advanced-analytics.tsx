import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Target,
  Users,
  Clock,
  Brain,
  Network,
  Sparkles
} from "lucide-react"

// Enhanced analytics data
const performanceMetrics = [
  { metric: 'Tag Adoption Rate', value: 78, change: 12, period: 'vs last month' },
  { metric: 'Search Efficiency', value: 65, change: 8, period: 'vs last month' },
  { metric: 'User Engagement', value: 82, change: -3, period: 'vs last month' },
  { metric: 'Data Quality Score', value: 91, change: 15, period: 'vs last month' },
]

const tagPerformanceData = [
  { tag: 'React Developer', usage: 145, efficiency: 92, satisfaction: 88 },
  { tag: 'Senior Level', usage: 128, efficiency: 89, satisfaction: 85 },
  { tag: 'Remote Ready', usage: 98, efficiency: 94, satisfaction: 91 },
  { tag: 'Team Lead', usage: 87, efficiency: 85, satisfaction: 82 },
  { tag: 'Full Stack', usage: 76, efficiency: 88, satisfaction: 89 },
]

const userSegmentData = [
  { segment: 'Power Users', count: 45, engagement: 95, efficiency: 92 },
  { segment: 'Regular Users', count: 128, engagement: 78, efficiency: 74 },
  { segment: 'Occasional Users', count: 67, engagement: 52, efficiency: 58 },
  { segment: 'New Users', count: 34, engagement: 35, efficiency: 41 },
]

const predictiveData = [
  { month: 'Jan', predicted: 150, actual: 145, confidence: 0.92 },
  { month: 'Feb', predicted: 165, actual: 158, confidence: 0.89 },
  { month: 'Mar', predicted: 180, actual: 172, confidence: 0.94 },
  { month: 'Apr', predicted: 195, actual: null, confidence: 0.87 },
  { month: 'May', predicted: 210, actual: null, confidence: 0.85 },
  { month: 'Jun', predicted: 225, actual: null, confidence: 0.83 },
]

const tagRelationshipData = [
  { source: 'React', target: 'JavaScript', strength: 0.95, type: 'skill' },
  { source: 'Senior', target: 'Lead', strength: 0.78, type: 'level' },
  { source: 'Full Stack', target: 'Frontend', strength: 0.85, type: 'role' },
  { source: 'Remote', target: 'Flexible', strength: 0.72, type: 'work_style' },
]

const aiInsights = [
  {
    type: 'opportunity',
    title: 'Emerging Skill Gap',
    description: 'AI/ML tags showing 340% growth but low adoption rate',
    impact: 'high',
    action: 'Create AI-focused tagging campaign'
  },
  {
    type: 'optimization',
    title: 'Tag Consolidation Opportunity',
    description: '12 similar tags could be merged to improve efficiency',
    impact: 'medium',
    action: 'Run automated merge workflow'
  },
  {
    type: 'trend',
    title: 'Remote Work Tags Trending',
    description: 'Remote-related tags up 156% in searches',
    impact: 'high',
    action: 'Expand remote work taxonomy'
  }
]

export function AdvancedAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = React.useState("30d")
  const [selectedMetric, setSelectedMetric] = React.useState("usage")
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = async (format: string) => {
    setIsExporting(true)
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsExporting(false)
    
    // In real app, this would trigger actual export
    console.log(`Exporting analytics in ${format} format`)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="h-4 w-4 text-green-500" />
      case 'optimization': return <Zap className="h-4 w-4 text-blue-500" />
      case 'trend': return <TrendingUp className="h-4 w-4 text-purple-500" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights and predictive analytics for your tagging system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {/* AI-Powered Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Machine learning insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge variant="outline" className={getImpactColor(insight.impact)}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {insight.description}
                  </p>
                  <Button size="sm" variant="outline">
                    {insight.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">{metric.value}%</span>
                    <div className={`flex items-center gap-1 text-xs ${
                      metric.change > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {metric.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(metric.change)}%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{metric.period}</p>
                </div>
                <div className="relative">
                  <div className="w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="hsl(var(--muted))"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="hsl(var(--primary))"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${metric.value * 1.76} 176`}
                        className="transition-all duration-300"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tag Performance Matrix
                </CardTitle>
                <CardDescription>
                  Usage vs efficiency correlation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={tagPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="usage" name="Usage" />
                    <YAxis dataKey="efficiency" name="Efficiency" />
                    <Tooltip 
                      formatter={(value, name) => [value, name === 'efficiency' ? 'Efficiency %' : 'Usage Count']}
                      labelFormatter={(label) => `Tag: ${tagPerformanceData.find(d => d.usage === label)?.tag}`}
                    />
                    <Scatter dataKey="efficiency" fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Tags</CardTitle>
                <CardDescription>
                  Based on usage and satisfaction scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tagPerformanceData.map((tag, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{tag.tag}</span>
                        <Badge variant="secondary">{tag.usage} uses</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Efficiency</span>
                          <span>{tag.efficiency}%</span>
                        </div>
                        <Progress value={tag.efficiency} className="h-1" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Satisfaction</span>
                          <span>{tag.satisfaction}%</span>
                        </div>
                        <Progress value={tag.satisfaction} className="h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Segment Analysis
              </CardTitle>
              <CardDescription>
                Engagement and efficiency by user type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={userSegmentData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="segment" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Engagement"
                    dataKey="engagement"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Efficiency"
                    dataKey="efficiency"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Predictive Analytics
              </CardTitle>
              <CardDescription>
                ML-powered usage predictions with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={predictiveData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Actual Usage"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted Usage"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {predictiveData.slice(-3).map((data, index) => (
                  <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">{data.month}</p>
                    <p className="text-lg font-bold text-accent">{data.predicted}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(data.confidence * 100)}% confidence
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Tag Relationship Mapping
              </CardTitle>
              <CardDescription>
                Discover hidden connections between tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tagRelationshipData.map((rel, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{rel.source}</Badge>
                      <div className="flex items-center gap-2">
                        <div className="h-px bg-border flex-1 w-8" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(rel.strength * 100)}%
                        </span>
                        <div className="h-px bg-border flex-1 w-8" />
                      </div>
                      <Badge variant="outline">{rel.target}</Badge>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {rel.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
                <CardDescription>
                  AI-driven suggestions to improve system performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Target className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Tag Consolidation</h4>
                    <p className="text-sm text-green-700">
                      Merge 8 similar tags to improve search efficiency by 23%
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Review Suggestions
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Workflow Automation</h4>
                    <p className="text-sm text-blue-700">
                      Auto-tag 60% of new candidates based on patterns
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Setup Automation
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Cleanup Schedule</h4>
                    <p className="text-sm text-purple-700">
                      Remove 15 unused tags to reduce cognitive load
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Schedule Cleanup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health Score</CardTitle>
                <CardDescription>
                  Overall tagging system performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-600 text-2xl font-bold">
                      87
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Health Score</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Tag Quality</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="mt-1" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>User Adoption</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="mt-1" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Search Efficiency</span>
                        <span>91%</span>
                      </div>
                      <Progress value={91} className="mt-1" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Data Consistency</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="mt-1" />
                    </div>
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