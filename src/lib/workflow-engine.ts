// Workflow Automation Engine for Phase 3
export interface WorkflowRule {
  id: string
  name: string
  description: string
  trigger: {
    type: "tag_created" | "tag_usage_threshold" | "schedule" | "manual"
    conditions: Array<{
      field: string
      operator: "equals" | "contains" | "greater_than" | "less_than"
      value: string | number
    }>
  }
  actions: Array<{
    type: "send_notification" | "auto_tag" | "merge_tags" | "archive_tag" | "create_report"
    parameters: Record<string, any>
  }>
  enabled: boolean
  createdAt: string
  lastExecuted?: string
  executionCount: number
}

export interface WorkflowExecution {
  id: string
  ruleId: string
  status: "pending" | "running" | "completed" | "failed"
  startedAt: string
  completedAt?: string
  logs: Array<{
    timestamp: string
    level: "info" | "warning" | "error"
    message: string
  }>
  results?: {
    tagsProcessed: number
    actionsExecuted: number
    errors: string[]
  }
}

export interface BulkOperation {
  id: string
  type: "merge" | "delete" | "update" | "export"
  targets: string[]
  parameters: Record<string, any>
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  createdAt: string
  completedAt?: string
  results?: {
    processed: number
    successful: number
    failed: number
    errors: string[]
  }
}

export class WorkflowEngine {
  private static instance: WorkflowEngine
  private rules: WorkflowRule[] = []
  private executions: WorkflowExecution[] = []
  private bulkOperations: BulkOperation[] = []
  
  private constructor() {
    this.initializeDefaultRules()
  }
  
  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine()
    }
    return WorkflowEngine.instance
  }

  // Rule Management
  createRule(rule: Omit<WorkflowRule, 'id' | 'createdAt' | 'executionCount'>): WorkflowRule {
    const newRule: WorkflowRule = {
      ...rule,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      executionCount: 0
    }
    
    this.rules.push(newRule)
    return newRule
  }

  getRules(): WorkflowRule[] {
    return [...this.rules]
  }

  updateRule(id: string, updates: Partial<WorkflowRule>): WorkflowRule | null {
    const index = this.rules.findIndex(r => r.id === id)
    if (index === -1) return null
    
    this.rules[index] = { ...this.rules[index], ...updates }
    return this.rules[index]
  }

  deleteRule(id: string): boolean {
    const index = this.rules.findIndex(r => r.id === id)
    if (index === -1) return false
    
    this.rules.splice(index, 1)
    return true
  }

  // Workflow Execution
  async executeRule(ruleId: string, context?: Record<string, any>): Promise<WorkflowExecution> {
    const rule = this.rules.find(r => r.id === ruleId)
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`)
    }

    const execution: WorkflowExecution = {
      id: Math.random().toString(36).substring(7),
      ruleId,
      status: "running",
      startedAt: new Date().toISOString(),
      logs: [{
        timestamp: new Date().toISOString(),
        level: "info",
        message: `Starting execution of rule: ${rule.name}`
      }]
    }

    this.executions.push(execution)

    try {
      // Simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      let tagsProcessed = 0
      let actionsExecuted = 0
      const errors: string[] = []

      // Execute each action
      for (const action of rule.actions) {
        try {
          await this.executeAction(action, context)
          actionsExecuted++
          
          execution.logs.push({
            timestamp: new Date().toISOString(),
            level: "info",
            message: `Executed action: ${action.type}`
          })
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          errors.push(errorMsg)
          
          execution.logs.push({
            timestamp: new Date().toISOString(),
            level: "error",
            message: `Action failed: ${action.type} - ${errorMsg}`
          })
        }
      }

      // Update execution
      execution.status = errors.length > 0 ? "failed" : "completed"
      execution.completedAt = new Date().toISOString()
      execution.results = {
        tagsProcessed,
        actionsExecuted,
        errors
      }

      // Update rule stats
      rule.executionCount++
      rule.lastExecuted = new Date().toISOString()

    } catch (error) {
      execution.status = "failed"
      execution.completedAt = new Date().toISOString()
      execution.logs.push({
        timestamp: new Date().toISOString(),
        level: "error",
        message: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    return execution
  }

  private async executeAction(action: any, context?: Record<string, any>): Promise<void> {
    switch (action.type) {
      case "send_notification":
        // Simulate sending notification
        console.log(`Sending notification: ${action.parameters.message}`)
        break
        
      case "auto_tag":
        // Simulate auto-tagging
        console.log(`Auto-tagging with: ${action.parameters.tags.join(', ')}`)
        break
        
      case "merge_tags":
        // Simulate tag merging
        console.log(`Merging tags: ${action.parameters.sourceTags} -> ${action.parameters.targetTag}`)
        break
        
      case "archive_tag":
        // Simulate archiving
        console.log(`Archiving tag: ${action.parameters.tagId}`)
        break
        
      case "create_report":
        // Simulate report creation
        console.log(`Creating report: ${action.parameters.reportType}`)
        break
        
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  // Bulk Operations
  async executeBulkOperation(operation: Omit<BulkOperation, 'id' | 'status' | 'progress' | 'createdAt'>): Promise<BulkOperation> {
    const bulkOp: BulkOperation = {
      ...operation,
      id: Math.random().toString(36).substring(7),
      status: "running",
      progress: 0,
      createdAt: new Date().toISOString()
    }

    this.bulkOperations.push(bulkOp)

    try {
      // Simulate bulk operation with progress updates
      const totalItems = operation.targets.length
      let processed = 0
      let successful = 0
      const errors: string[] = []

      for (let i = 0; i < totalItems; i++) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 100))
        
        try {
          // Simulate operation on each target
          await this.processBulkTarget(operation.type, operation.targets[i], operation.parameters)
          successful++
        } catch (error) {
          errors.push(`Failed to process ${operation.targets[i]}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
        
        processed++
        bulkOp.progress = Math.round((processed / totalItems) * 100)
      }

      bulkOp.status = errors.length === 0 ? "completed" : (successful > 0 ? "completed" : "failed")
      bulkOp.completedAt = new Date().toISOString()
      bulkOp.results = {
        processed,
        successful,
        failed: processed - successful,
        errors
      }

    } catch (error) {
      bulkOp.status = "failed"
      bulkOp.completedAt = new Date().toISOString()
      bulkOp.results = {
        processed: 0,
        successful: 0,
        failed: operation.targets.length,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }

    return bulkOp
  }

  private async processBulkTarget(type: string, target: string, parameters: Record<string, any>): Promise<void> {
    switch (type) {
      case "merge":
        console.log(`Merging tag ${target} into ${parameters.targetTag}`)
        break
      case "delete":
        console.log(`Deleting tag ${target}`)
        break
      case "update":
        console.log(`Updating tag ${target} with`, parameters.updates)
        break
      case "export":
        console.log(`Exporting tag ${target}`)
        break
      default:
        throw new Error(`Unknown bulk operation type: ${type}`)
    }
  }

  getBulkOperations(): BulkOperation[] {
    return [...this.bulkOperations]
  }

  getBulkOperation(id: string): BulkOperation | null {
    return this.bulkOperations.find(op => op.id === id) || null
  }

  // Execution History
  getExecutions(ruleId?: string): WorkflowExecution[] {
    if (ruleId) {
      return this.executions.filter(ex => ex.ruleId === ruleId)
    }
    return [...this.executions]
  }

  getExecution(id: string): WorkflowExecution | null {
    return this.executions.find(ex => ex.id === id) || null
  }

  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: "duplicate-cleanup",
        name: "Automatic Duplicate Cleanup",
        description: "Automatically merge duplicate tags when detected",
        trigger: {
          type: "tag_created",
          conditions: [
            { field: "similarity", operator: "greater_than", value: 0.9 }
          ]
        },
        actions: [
          {
            type: "send_notification",
            parameters: {
              message: "Potential duplicate detected",
              recipients: ["admin@company.com"]
            }
          },
          {
            type: "merge_tags",
            parameters: {
              autoMerge: false,
              requireApproval: true
            }
          }
        ],
        enabled: true,
        createdAt: "2024-01-01T00:00:00Z",
        executionCount: 5,
        lastExecuted: "2024-01-20T10:30:00Z"
      },
      {
        id: "unused-tag-cleanup",
        name: "Unused Tag Cleanup",
        description: "Archive tags that haven't been used in 90 days",
        trigger: {
          type: "schedule",
          conditions: [
            { field: "lastUsed", operator: "less_than", value: "90d" },
            { field: "usage", operator: "equals", value: 0 }
          ]
        },
        actions: [
          {
            type: "archive_tag",
            parameters: {
              notifyCreator: true,
              gracePeriod: "7d"
            }
          }
        ],
        enabled: true,
        createdAt: "2024-01-01T00:00:00Z",
        executionCount: 12,
        lastExecuted: "2024-01-15T02:00:00Z"
      }
    ]
  }
}