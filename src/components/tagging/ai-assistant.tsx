import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { AdvancedAIEngine, TagRecommendation, ContentAnalysis } from "@/lib/ai-engine"
import { 
  Brain, 
  Sparkles, 
  Zap, 
  MessageSquare, 
  Lightbulb,
  TrendingUp,
  Target,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  Loader2,
  Bot,
  User
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  metadata?: {
    analysis?: ContentAnalysis
    recommendations?: TagRecommendation[]
    confidence?: number
  }
}

export function AIAssistant() {
  const [engine] = React.useState(() => AdvancedAIEngine.getInstance())
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [candidateContent, setCandidateContent] = React.useState("")
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // Initialize with welcome message
  React.useEffect(() => {
    setMessages([{
      id: "welcome",
      type: "assistant",
      content: "Hi! I'm your AI tagging assistant. I can help you analyze candidate profiles, recommend tags, and optimize your tagging strategy. Try pasting a job description or candidate profile to get started!",
      timestamp: new Date()
    }])
  }, [])

  // Auto-scroll to bottom when new messages are added
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleAnalyzeContent = async () => {
    if (!candidateContent.trim()) {
      toast({
        title: "No Content",
        description: "Please enter some content to analyze",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: candidateContent,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])

    try {
      // Analyze content
      const analysis = await engine.analyzeContent(candidateContent)
      
      // Generate recommendations
      const recommendations = await engine.generateTagRecommendations(
        candidateContent,
        [],
        {
          role: "developer", // This would come from context in real app
          industry: "technology"
        }
      )

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I've analyzed the content and found ${analysis.keywords.length} key terms with ${Math.round(analysis.confidence * 100)}% confidence. The sentiment is ${analysis.sentiment}. Here are my tag recommendations:`,
        timestamp: new Date(),
        metadata: {
          analysis,
          recommendations,
          confidence: analysis.confidence
        }
      }

      setMessages(prev => [...prev, assistantMessage])
      
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
      setCandidateContent("")
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue("")

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can help you optimize your tagging strategy. What specific area would you like to improve?",
        "Based on your usage patterns, I recommend consolidating similar tags to improve search efficiency.",
        "Consider using more specific tags for better candidate matching. For example, 'React Developer' instead of just 'Developer'.",
        "Your tag hierarchy could benefit from standardization. Would you like me to suggest some improvements?"
      ]
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    }, 1000)
  }

  const handleApplyRecommendation = (recommendation: TagRecommendation) => {
    toast({
      title: "Tag Applied",
      description: `Applied "${recommendation.tag}" with ${Math.round(recommendation.confidence * 100)}% confidence`,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Tagging Assistant
          </h1>
          <p className="text-muted-foreground">
            Intelligent recommendations and analysis powered by machine learning
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Conversation
              </CardTitle>
              <CardDescription>
                Chat with the AI to get tagging insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          
                          {/* Show analysis results */}
                          {message.metadata?.analysis && (
                            <div className="mt-3 space-y-2">
                              <div className="flex flex-wrap gap-1">
                                <span className="text-xs opacity-75">Keywords:</span>
                                {message.metadata.analysis.keywords.slice(0, 5).map((keyword, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs opacity-75">Sentiment:</span>
                                <Badge variant={
                                  message.metadata.analysis.sentiment === 'positive' ? 'default' :
                                  message.metadata.analysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                                } className="text-xs">
                                  {message.metadata.analysis.sentiment}
                                </Badge>
                              </div>
                            </div>
                          )}
                          
                          {/* Show recommendations */}
                          {message.metadata?.recommendations && (
                            <div className="mt-3 space-y-2">
                              <span className="text-xs opacity-75">Recommended Tags:</span>
                              <div className="space-y-1">
                                {message.metadata.recommendations.slice(0, 5).map((rec, i) => (
                                  <div key={i} className="flex items-center justify-between bg-background/50 rounded p-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {rec.tag}
                                      </Badge>
                                      <span className="text-xs opacity-75">
                                        {Math.round(rec.confidence * 100)}%
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => handleApplyRecommendation(rec)}
                                    >
                                      Apply
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about tagging strategies, analysis, or optimization..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-6">
          {/* Content Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Content Analysis
              </CardTitle>
              <CardDescription>
                Paste candidate content for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={candidateContent}
                onChange={(e) => setCandidateContent(e.target.value)}
                placeholder="Paste job description, resume, or candidate profile here..."
                rows={8}
                className="resize-none"
              />
              <Button 
                onClick={handleAnalyzeContent}
                disabled={isAnalyzing || !candidateContent.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Lightbulb className="h-4 w-4 mr-2" />
                Suggest tag improvements
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyze tag trends
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Optimize search results
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Review tag taxonomy
              </Button>
            </CardContent>
          </Card>

          {/* AI Stats */}
          <Card>
            <CardHeader>
              <CardTitle>AI Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy Rate</span>
                  <span>94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Recommendations Applied</span>
                  <span>67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>User Satisfaction</span>
                  <span>89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between text-sm">
                <span>Analyses this month</span>
                <Badge variant="secondary">1,247</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Tags generated</span>
                <Badge variant="secondary">3,891</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}