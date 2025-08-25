import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { WorkflowEngine, WorkflowRule, BulkOperation } from "@/lib/workflow-engine"
import { 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Bot,
  Workflow,
  History,
  Download,
  Upload,
  RefreshCw
} from "lucide-react"

export function WorkflowAutomation() {
  const [engine] = React.useState(() => WorkflowEngine.getInstance())
  const [rules, setRules] = React.useState<WorkflowRule[]>([])
  const [bulkOperations, setBulkOperations] = React.useState<BulkOperation[]>([])
  const [selectedRule, setSelectedRule] = React.useState<WorkflowRule | null>(null)
  const [isExecuting, setIsExecuting] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    setRules(engine.getRules())
    setBulkOperations(engine.getBulkOperations())
  }, [engine])

  const handleExecuteRule = async (ruleId: string) => {
    setIsExecuting(ruleId)
    try {
      const execution = await engine.executeRule(ruleId)
      toast({
        title: "Workflow Executed",
        description: `Rule executed with status: ${execution.status}`,
      })
      
      // Refresh data
      setRules(engine.getRules())
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setIsExecuting(null)
    }
  }

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    engine.updateRule(ruleId, { enabled })
    setRules(engine.getRules())
    
    toast({
      title: enabled ? "Rule Enabled" : "Rule Disabled",
      description: `Workflow rule ${enabled ? 'activated' : 'deactivated'}`,
    })
  }

  const handleBulkOperation = async (type: string, targets: string[]) => {
    if (targets.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items for bulk operation",
        variant: "destructive"
      })
      return
    }

    const operation = await engine.executeBulkOperation({
      type: type as any,
      targets,
      parameters: {}
    })

    setBulkOperations(engine.getBulkOperations())
    
    toast({
      title: "Bulk Operation Started",
      description: `Processing ${targets.length} items`,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running": return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTriggerTypeIcon = (type: string) => {
    switch (type) {
      case "tag_created": return <Plus className="h-4 w-4" />
      case "schedule": return <Clock className="h-4 w-4" />
      case "manual": return <Play className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workflow Automation</h1>
          <p className="text-muted-foreground">
            Automate repetitive tasks and enforce tagging governance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Workflow Rule</DialogTitle>
                <DialogDescription>
                  Set up automated actions based on triggers and conditions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ruleName">Rule Name</Label>
                    <Input id="ruleName" placeholder="e.g. Auto-merge duplicates" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="triggerType">Trigger Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tag_created">Tag Created</SelectItem>
                        <SelectItem value="schedule">Scheduled</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="tag_usage_threshold">Usage Threshold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe what this rule does..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Actions</Label>
                  <div className="border rounded-lg p-4 space-y-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="send_notification">Send Notification</SelectItem>
                        <SelectItem value="auto_tag">Auto Tag</SelectItem>
                        <SelectItem value="merge_tags">Merge Tags</SelectItem>
                        <SelectItem value="archive_tag">Archive Tag</SelectItem>
                        <SelectItem value="create_report">Create Report</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Action
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {/* Active Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Automation Rules
              </CardTitle>
              <CardDescription>
                Manage automated workflows and triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead className="text-right">Controls</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTriggerTypeIcon(rule.trigger.type)}
                          <span className="capitalize">{rule.trigger.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {rule.actions.length} actions
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={rule.enabled}
                            onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                          />
                          <span className="text-sm">
                            {rule.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {rule.lastExecuted ? new Date(rule.lastExecuted).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleExecuteRule(rule.id)}
                            disabled={isExecuting === rule.id}
                          >
                            {isExecuting === rule.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          {/* Bulk Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Bulk Actions
                </CardTitle>
                <CardDescription>
                  Perform operations on multiple tags at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleBulkOperation('merge', ['tag1', 'tag2'])}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Bulk Merge
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleBulkOperation('delete', ['unused1', 'unused2'])}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Bulk Delete
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleBulkOperation('update', ['tag3', 'tag4'])}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Bulk Update
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleBulkOperation('export', ['all'])}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Export
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <Label className="text-sm font-medium">Quick Actions</Label>
                  <div className="mt-2 space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Zap className="h-4 w-4 mr-2" />
                      Cleanup unused tags (15 found)
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Merge duplicates (8 pairs found)
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Validate tag taxonomy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operation Status</CardTitle>
                <CardDescription>
                  Monitor ongoing bulk operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bulkOperations.slice(0, 5).map((operation) => (
                    <div key={operation.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(operation.status)}
                          <span className="font-medium capitalize">{operation.type}</span>
                        </div>
                        <Badge variant="outline">
                          {operation.targets.length} items
                        </Badge>
                      </div>
                      
                      {operation.status === 'running' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{operation.progress}%</span>
                          </div>
                          <Progress value={operation.progress} className="h-1" />
                        </div>
                      )}
                      
                      {operation.results && (
                        <div className="text-xs text-muted-foreground">
                          {operation.results.successful} successful, {operation.results.failed} failed
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {bulkOperations.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No bulk operations running
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Execution History
              </CardTitle>
              <CardDescription>
                Track workflow executions and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engine.getExecutions().slice(0, 10).map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(execution.status)}
                      <div>
                        <p className="font-medium">
                          {rules.find(r => r.id === execution.ruleId)?.name || 'Unknown Rule'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(execution.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={execution.status === 'completed' ? 'default' : 'destructive'}>
                        {execution.status}
                      </Badge>
                      {execution.results && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {execution.results.actionsExecuted} actions
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Duplicate Detection",
                description: "Automatically detect and merge duplicate tags",
                category: "Data Quality"
              },
              {
                name: "Unused Tag Cleanup",
                description: "Archive tags not used in 90 days",
                category: "Maintenance"
              },
              {
                name: "Tag Approval Workflow",
                description: "Require approval for new tags",
                category: "Governance"
              },
              {
                name: "Auto-tagging Rules",
                description: "Automatically apply tags based on content",
                category: "Efficiency"
              },
              {
                name: "Quality Scoring",
                description: "Score tags based on usage and relevance",
                category: "Analytics"
              },
              {
                name: "Notification Rules",
                description: "Send alerts for important tag events",
                category: "Communication"
              }
            ].map((template, index) => (
              <Card key={index} className="cursor-pointer transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{template.category}</Badge>
                    <Button size="sm">Use Template</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}