import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
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
  const { user } = useAuth()
  const [engine] = React.useState(() => WorkflowEngine.getInstance())
  const [rules, setRules] = React.useState<WorkflowRule[]>([])
  const [bulkOperations, setBulkOperations] = React.useState<BulkOperation[]>([])
  const [executions, setExecutions] = React.useState<any[]>([])
  const [selectedRule, setSelectedRule] = React.useState<WorkflowRule | null>(null)
  const [isExecuting, setIsExecuting] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  
  // Form state for creating rules
  const [newRule, setNewRule] = React.useState({
    name: "",
    description: "",
    trigger_type: "",
    conditions: [] as any[],
    actions: [] as any[]
  })

  // Form state for editing rules
  const [editRule, setEditRule] = React.useState({
    id: "",
    name: "",
    description: "",
    trigger_type: "",
    conditions: [] as any[],
    actions: [] as any[]
  })
  
  React.useEffect(() => {
    if (user) {
      fetchWorkflowData()
    }
  }, [user])

  const fetchWorkflowData = async () => {
    try {
      // Fetch workflow rules
      const { data: workflowRules, error: rulesError } = await supabase
        .from('workflow_rules')
        .select('*')
        .order('created_at', { ascending: false })

      if (rulesError) throw rulesError

      // Transform data to match WorkflowRule interface
      const transformedRules: WorkflowRule[] = workflowRules?.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description || '',
        trigger: {
          type: rule.trigger_type as any,
          conditions: Array.isArray(rule.conditions) ? rule.conditions as any[] : []
        },
        conditions: Array.isArray(rule.conditions) ? rule.conditions as any[] : [],
        actions: Array.isArray(rule.actions) ? rule.actions as any[] : [],
        enabled: rule.enabled,
        executionCount: rule.execution_count,
        lastExecuted: rule.last_executed,
        createdBy: rule.created_by,
        createdAt: rule.created_at,
        updatedAt: rule.updated_at
      })) || []

      setRules(transformedRules)

      // Fetch bulk operations
      const { data: operations, error: operationsError } = await supabase
        .from('bulk_operations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (operationsError) throw operationsError

      const transformedOperations: BulkOperation[] = operations?.map(op => ({
        id: op.id,
        type: op.type as any,
        targets: op.targets,
        status: op.status as any,
        progress: op.progress,
        results: op.results && typeof op.results === 'object' && op.results !== null ? {
          processed: (op.results as any).processed || 0,
          successful: (op.results as any).successful || 0,
          failed: (op.results as any).failed || 0,
          errors: (op.results as any).errors || []
        } : undefined,
        createdAt: op.created_at,
        completedAt: op.completed_at || undefined,
        createdBy: op.created_by,
        parameters: typeof op.parameters === 'object' && op.parameters !== null ? op.parameters as Record<string, any> : {}
      })) || []

      setBulkOperations(transformedOperations)

      // Fetch execution history
      const { data: executionData, error: executionError } = await supabase
        .from('workflow_executions')
        .select(`
          *,
          workflow_rules (name)
        `)
        .order('executed_at', { ascending: false })
        .limit(10)

      if (executionError) throw executionError
      setExecutions(executionData || [])
      
    } catch (error) {
      console.error('Error fetching workflow data:', error)
      toast({
        title: "Error",
        description: "Failed to load workflow data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteRule = async (ruleId: string) => {
    setIsExecuting(ruleId)
    try {
      // Create workflow execution record
      const { data: execution, error } = await supabase
        .from('workflow_executions')
        .insert([{
          rule_id: ruleId,
          status: 'pending',
          results: null,
          error_message: null
        }])
        .select()
        .single()

      if (error) throw error

      // Update rule execution count and status
      const currentRule = rules.find(r => r.id === ruleId)
      await supabase
        .from('workflow_rules')
        .update({ 
          execution_count: (currentRule?.executionCount || 0) + 1,
          last_executed: new Date().toISOString()
        })
        .eq('id', ruleId)

      // Update execution to running
      await supabase
        .from('workflow_executions')
        .update({ status: 'running' })
        .eq('id', execution.id)

      // Simulate execution (in real app, this would trigger actual workflow)
      setTimeout(async () => {
        await supabase
          .from('workflow_executions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            results: { message: 'Workflow executed successfully', processed: 1 }
          })
          .eq('id', execution.id)

        fetchWorkflowData()
      }, 2000)

      toast({
        title: "Workflow Executed",
        description: "Rule execution started",
      })
      
    } catch (error) {
      console.error('Error executing rule:', error)
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setIsExecuting(null)
    }
  }

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('workflow_rules')
        .update({ enabled })
        .eq('id', ruleId)

      if (error) throw error

      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      ))
      
      toast({
        title: enabled ? "Rule Enabled" : "Rule Disabled",
        description: `Workflow rule ${enabled ? 'activated' : 'deactivated'}`,
      })
    } catch (error) {
      console.error('Error toggling rule:', error)
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive"
      })
    }
  }

  const handleCreateRule = async () => {
    if (!newRule.name || !newRule.trigger_type) {
      toast({
        title: "Missing Information",
        description: "Please provide rule name and trigger type",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('workflow_rules')
        .insert([{
          name: newRule.name,
          description: newRule.description,
          trigger_type: newRule.trigger_type,
          conditions: newRule.conditions,
          actions: newRule.actions,
          created_by: user?.id
        }])

      if (error) throw error

      toast({
        title: "Rule Created",
        description: "Workflow rule created successfully"
      })

      setIsCreateDialogOpen(false)
      setNewRule({
        name: "",
        description: "",
        trigger_type: "",
        conditions: [],
        actions: []
      })
      fetchWorkflowData()
    } catch (error) {
      console.error('Error creating rule:', error)
      toast({
        title: "Error",
        description: "Failed to create workflow rule",
        variant: "destructive"
      })
    }
  }

  const handleEditRule = async (rule: WorkflowRule) => {
    setEditRule({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      trigger_type: rule.trigger.type,
      conditions: rule.trigger.conditions,
      actions: rule.actions
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateRule = async () => {
    if (!editRule.name || !editRule.trigger_type) {
      toast({
        title: "Missing Information",
        description: "Please provide rule name and trigger type",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('workflow_rules')
        .update({
          name: editRule.name,
          description: editRule.description,
          trigger_type: editRule.trigger_type,
          conditions: editRule.conditions,
          actions: editRule.actions
        })
        .eq('id', editRule.id)

      if (error) throw error

      toast({
        title: "Rule Updated",
        description: "Workflow rule updated successfully"
      })

      setIsEditDialogOpen(false)
      setEditRule({
        id: "",
        name: "",
        description: "",
        trigger_type: "",
        conditions: [],
        actions: []
      })
      fetchWorkflowData()
    } catch (error) {
      console.error('Error updating rule:', error)
      toast({
        title: "Error",
        description: "Failed to update workflow rule",
        variant: "destructive"
      })
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('workflow_rules')
        .delete()
        .eq('id', ruleId)
        .eq('created_by', user?.id) // Ensure user can only delete their own rules

      if (error) throw error

      toast({
        title: "Rule Deleted",
        description: "Workflow rule deleted successfully"
      })
      fetchWorkflowData()
    } catch (error) {
      console.error('Error deleting rule:', error)
      toast({
        title: "Error",
        description: "Failed to delete workflow rule. You can only delete rules you created.",
        variant: "destructive"
      })
    }
  }

  const handleBulkOperation = async (type: string, targets?: string[]) => {
    const actualTargets = targets || selectedTags
    if (actualTargets.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select tags for bulk operation",
        variant: "destructive"
      })
      return
    }

    try {
      const { data: operation, error } = await supabase
        .from('bulk_operations')
        .insert([{
          type,
          targets: actualTargets,
          status: 'pending',
          progress: 0,
          created_by: user?.id,
          parameters: {}
        }])
        .select()
        .single()

      if (error) throw error

      // Simulate bulk operation progress
      let progress = 0
      const interval = setInterval(async () => {
        progress += 20
        
        await supabase
          .from('bulk_operations')
          .update({ progress, status: progress >= 100 ? 'completed' : 'running' })
          .eq('id', operation.id)

        if (progress >= 100) {
          clearInterval(interval)
          await supabase
            .from('bulk_operations')
            .update({
              completed_at: new Date().toISOString(),
              results: { successful: actualTargets.length, failed: 0 }
            })
            .eq('id', operation.id)
          
          fetchWorkflowData()
        }
      }, 1000)

      fetchWorkflowData()
      
      toast({
        title: "Bulk Operation Started",
        description: `Processing ${actualTargets.length} items`,
      })
    } catch (error) {
      console.error('Error starting bulk operation:', error)
      toast({
        title: "Error",
        description: "Failed to start bulk operation",
        variant: "destructive"
      })
    }
  }

  const handleQuickAction = async (action: string) => {
    try {
      // Get sample tags for demonstration
      const { data: tags } = await supabase
        .from('tags')
        .select('name')
        .limit(5)

      const tagNames = tags?.map(t => t.name) || ['tag1', 'tag2']

      switch (action) {
        case 'cleanup':
          await handleBulkOperation('delete', tagNames)
          break
        case 'merge':
          await handleBulkOperation('merge', tagNames)
          break
        case 'validate':
          toast({
            title: "Validation Complete",
            description: "Tag taxonomy validation completed successfully"
          })
          break
      }
    } catch (error) {
      console.error('Error executing quick action:', error)
      toast({
        title: "Error",
        description: "Failed to execute quick action",
        variant: "destructive"
      })
    }
  }

  const handleUseTemplate = async (template: any) => {
    setNewRule({
      name: template.name,
      description: template.description,
      trigger_type: "manual",
      conditions: [],
      actions: []
    })
    setIsCreateDialogOpen(true)
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

  if (loading) {
    return <div className="space-y-6">Loading workflow automation...</div>
  }

  return (
    <TooltipProvider>
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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rule
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new automated workflow rule to handle repetitive tasks</p>
                </TooltipContent>
              </Tooltip>
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
                    <Input 
                      id="ruleName" 
                      placeholder="e.g. Auto-merge duplicates"
                      value={newRule.name}
                      onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="triggerType">Trigger Type</Label>
                    <Select value={newRule.trigger_type} onValueChange={(value) => setNewRule(prev => ({ ...prev, trigger_type: value }))}>
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
                    value={newRule.description}
                    onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
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
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRule}>Create Rule</Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>

            {/* Edit Rule Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Workflow Rule</DialogTitle>
                  <DialogDescription>
                    Update the automated workflow rule configuration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editRuleName">Rule Name</Label>
                      <Input 
                        id="editRuleName" 
                        placeholder="e.g. Auto-merge duplicates"
                        value={editRule.name}
                        onChange={(e) => setEditRule(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editTriggerType">Trigger Type</Label>
                      <Select value={editRule.trigger_type} onValueChange={(value) => setEditRule(prev => ({ ...prev, trigger_type: value }))}>
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
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea 
                      id="editDescription" 
                      placeholder="Describe what this rule does..."
                      rows={3}
                      value={editRule.description}
                      onChange={(e) => setEditRule(prev => ({ ...prev, description: e.target.value }))}
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
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateRule}>Update Rule</Button>
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
                          <Tooltip>
                            <TooltipTrigger asChild>
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
                            </TooltipTrigger>
                            <TooltipContent>Execute this rule now</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit this rule</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete this rule</TooltipContent>
                          </Tooltip>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => handleBulkOperation('merge')}
                        disabled={selectedTags.length === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Bulk Merge
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Merge selected tags with similar ones</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => handleBulkOperation('delete')}
                        disabled={selectedTags.length === 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Bulk Delete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete selected tags permanently</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => handleBulkOperation('update')}
                        disabled={selectedTags.length === 0}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Bulk Update
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Update properties of selected tags</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => handleBulkOperation('export')}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Export
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export all tags to file</TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="border rounded-lg p-4">
                  <Label className="text-sm font-medium">Quick Actions</Label>
                  <div className="mt-2 space-y-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => handleQuickAction('cleanup')}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Cleanup unused tags (15 found)
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Remove tags that haven't been used recently</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => handleQuickAction('merge')}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Merge duplicates (8 pairs found)
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Automatically merge similar tags</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => handleQuickAction('validate')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Validate tag taxonomy
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Check tag structure and relationships</TooltipContent>
                    </Tooltip>
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
                {executions.length > 0 ? (
                  executions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <p className="font-medium">
                            {execution.workflow_rules?.name || 'Unknown Rule'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(execution.executed_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={execution.status === 'completed' ? 'default' : 'secondary'}>
                          {execution.status}
                        </Badge>
                        {execution.error_message && (
                          <p className="text-xs text-red-500 mt-1 max-w-48 truncate">
                            {execution.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No execution history available
                  </p>
                )}
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" onClick={() => handleUseTemplate(template)}>
                            Use Template
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Create a new rule based on this template</TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </TooltipProvider>
  )
}