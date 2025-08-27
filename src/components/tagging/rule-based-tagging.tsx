import * as React from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  Zap, 
  Plus, 
  Settings, 
  Tag, 
  FileText, 
  User, 
  Mail, 
  MapPin, 
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause
} from "lucide-react"

interface AutoTagRule {
  id: string
  name: string
  description: string
  enabled: boolean
  trigger_type: string
  trigger_config?: any
  conditions: any
  actions: any
  execution_count: number
  last_executed: string | null
  created_at: string
}

interface NewRule {
  name: string
  description: string
  trigger_type: string
  conditions: Array<{
    field: string
    operator: string
    value: string
  }>
  actions: Array<{
    type: string
    tag_id: string
  }>
}

export function RuleBasedTagging() {
  const { toast } = useToast()
  const [rules, setRules] = React.useState<AutoTagRule[]>([])
  const [tags, setTags] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isCreating, setIsCreating] = React.useState(false)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)

  const [newRule, setNewRule] = React.useState<NewRule>({
    name: '',
    description: '',
    trigger_type: 'profile_keywords',
    conditions: [{ field: 'profile_text', operator: 'contains', value: '' }],
    actions: [{ type: 'add_tag', tag_id: '' }]
  })

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [rulesResult, tagsResult] = await Promise.all([
        supabase
          .from('workflow_rules')
          .select('*')
          .eq('trigger_type', 'candidate_added')
          .order('created_at', { ascending: false }),
        supabase
          .from('tags')
          .select('*')
          .order('name')
      ])

      if (rulesResult.error) throw rulesResult.error
      if (tagsResult.error) throw tagsResult.error

      setRules(rulesResult.data || [])
      setTags(tagsResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load rules and tags",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRule = async () => {
    if (!newRule.name || !newRule.trigger_type || newRule.conditions.some(c => !c.value) || newRule.actions.some(a => !a.tag_id)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreating(true)

      // Add tag names to actions
      const actionsWithNames = newRule.actions.map(action => {
        const tag = tags.find(t => t.id === action.tag_id)
        return {
          ...action,
          tag_name: tag?.name || ''
        }
      })

      const { error } = await supabase
        .from('workflow_rules')
        .insert({
          name: newRule.name,
          description: newRule.description,
          trigger_type: 'candidate_added',
          trigger_config: {
            auto_tag: true,
            rule_type: newRule.trigger_type
          },
          conditions: newRule.conditions,
          actions: actionsWithNames,
          enabled: true,
          created_by: user?.id
        })

      if (error) throw error

      toast({
        title: "Rule Created",
        description: "Auto-tagging rule has been created successfully",
      })

      setShowCreateDialog(false)
      setNewRule({
        name: '',
        description: '',
        trigger_type: 'profile_keywords',
        conditions: [{ field: 'profile_text', operator: 'contains', value: '' }],
        actions: [{ type: 'add_tag', tag_id: '' }]
      })
      
      fetchData()
    } catch (error) {
      console.error('Error creating rule:', error)
      toast({
        title: "Error",
        description: "Failed to create rule",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
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
        description: `Auto-tagging rule ${enabled ? 'activated' : 'deactivated'}`,
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

  const addCondition = () => {
    setNewRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: 'profile_text', operator: 'contains', value: '' }]
    }))
  }

  const removeCondition = (index: number) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }))
  }

  const updateCondition = (index: number, field: string, value: string) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }))
  }

  const addAction = () => {
    setNewRule(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'add_tag', tag_id: '' }]
    }))
  }

  const removeAction = (index: number) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }))
  }

  const updateAction = (index: number, tag_id: string) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, tag_id } : action
      )
    }))
  }

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'profile_keywords': return <FileText className="h-4 w-4" />
      case 'email_domain': return <Mail className="h-4 w-4" />
      case 'location': return <MapPin className="h-4 w-4" />
      case 'experience': return <Briefcase className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getFieldOptions = (triggerType: string) => {
    switch (triggerType) {
      case 'profile_keywords':
        return [
          { value: 'profile_text', label: 'Profile Text' },
          { value: 'name', label: 'Name' }
        ]
      case 'email_domain':
        return [
          { value: 'email', label: 'Email Address' }
        ]
      case 'location':
        return [
          { value: 'profile_text', label: 'Profile Text (Location)' }
        ]
      case 'experience':
        return [
          { value: 'profile_text', label: 'Profile Text (Experience)' }
        ]
      default:
        return [
          { value: 'profile_text', label: 'Profile Text' }
        ]
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rule-Based Auto-Tagging</h1>
          <p className="text-muted-foreground">Loading auto-tagging rules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rule-Based Auto-Tagging</h1>
          <p className="text-muted-foreground">
            Automatically tag candidates based on profile content and attributes
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Auto-Tagging Rule</DialogTitle>
              <DialogDescription>
                Define conditions and actions for automatic candidate tagging
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., React Developer Auto-Tag"
                  />
                </div>
                <div>
                  <Label htmlFor="trigger-type">Trigger Type</Label>
                  <Select value={newRule.trigger_type} onValueChange={(value) => setNewRule(prev => ({ ...prev, trigger_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profile_keywords">Profile Keywords</SelectItem>
                      <SelectItem value="email_domain">Email Domain</SelectItem>
                      <SelectItem value="location">Location-based</SelectItem>
                      <SelectItem value="experience">Experience Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRule.description}
                  onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this rule does..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Conditions (When to trigger)</Label>
                <div className="space-y-2 mt-2">
                  {newRule.conditions.map((condition, index) => (
                    <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                      <Select value={condition.field} onValueChange={(value) => updateCondition(index, 'field', value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getFieldOptions(newRule.trigger_type).map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={condition.operator} onValueChange={(value) => updateCondition(index, 'operator', value)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contains">contains</SelectItem>
                          <SelectItem value="equals">equals</SelectItem>
                          <SelectItem value="starts_with">starts with</SelectItem>
                          <SelectItem value="ends_with">ends with</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        value={condition.value}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        placeholder="Enter value..."
                        className="flex-1"
                      />

                      {newRule.conditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCondition}
                    className="gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Add Condition
                  </Button>
                </div>
              </div>

              <div>
                <Label>Actions (Tags to apply)</Label>
                <div className="space-y-2 mt-2">
                  {newRule.actions.map((action, index) => (
                    <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <Select value={action.tag_id} onValueChange={(value) => updateAction(index, value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select tag to apply..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tags.map(tag => (
                            <SelectItem key={tag.id} value={tag.id}>
                              <div className="flex items-center gap-2">
                                <span>{tag.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {tag.type}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {newRule.actions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAction}
                    className="gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Add Tag Action
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRule} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Rule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Active Rules</TabsTrigger>
          <TabsTrigger value="preview">Rule Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {rules.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTriggerIcon(rule.trigger_config?.rule_type || 'profile_keywords')}
                        <div>
                          <CardTitle className="text-lg">{rule.name}</CardTitle>
                          <CardDescription>{rule.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                        />
                        <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-success' : 'bg-muted'}`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Conditions:</p>
                        <div className="space-y-1">
                          {rule.conditions?.map((condition: any, index: number) => (
                            <div key={index} className="text-sm text-muted-foreground bg-muted p-2 rounded">
                              {condition.field} {condition.operator} "{condition.value}"
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Actions:</p>
                        <div className="flex flex-wrap gap-2">
                          {rule.actions?.map((action: any, index: number) => (
                            <Badge key={index} variant="secondary">
                              Add tag: {action.tag_name || action.tag_id}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>{rule.execution_count} executions</span>
                          </div>
                          {rule.last_executed && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Last: {new Date(rule.last_executed).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <Pause className="h-3 w-3 mr-1" />
                              Paused
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Auto-Tagging Rules</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Create your first rule to automatically tag candidates based on their profiles, 
                  email domains, or other attributes.
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Rule
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Rule Preview & Testing
              </CardTitle>
              <CardDescription>
                Preview how your rules will work with candidate profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-profile">Test Profile Text</Label>
                  <Textarea
                    id="test-profile"
                    placeholder="Enter candidate profile text to test against your rules..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="test-email">Test Email</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="candidate@example.com"
                  />
                </div>
                <Button className="gap-2">
                  <Play className="h-4 w-4" />
                  Test Rules
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Rule testing will show which tags would be automatically applied to a candidate 
                  with the provided profile information.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}