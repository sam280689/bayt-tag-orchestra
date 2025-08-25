// Smart suggestion engine for Phase 2
import { TagSuggestion } from "@/components/ui/tag-input"

export interface UserContext {
  role: "recruiter" | "seeker" | "manager"
  industry: string
  recentTags: string[]
  searchHistory: string[]
}

export interface SuggestionContext {
  currentTags: string[]
  inputText: string
  userContext: UserContext
  candidateProfile?: {
    skills: string[]
    experience: string
    location: string
  }
}

// Mock AI-powered suggestion engine
export class SmartSuggestionEngine {
  private static instance: SmartSuggestionEngine
  
  private constructor() {}
  
  static getInstance(): SmartSuggestionEngine {
    if (!SmartSuggestionEngine.instance) {
      SmartSuggestionEngine.instance = new SmartSuggestionEngine()
    }
    return SmartSuggestionEngine.instance
  }

  // Simulate AI-powered contextual suggestions
  generateSmartSuggestions(context: SuggestionContext): TagSuggestion[] {
    const suggestions: TagSuggestion[] = []
    
    // Contextual suggestions based on role
    if (context.userContext.role === "recruiter") {
      suggestions.push(...this.getRecruiterSuggestions(context))
    } else if (context.userContext.role === "seeker") {
      suggestions.push(...this.getSeekerSuggestions(context))
    }
    
    // Industry-specific suggestions
    suggestions.push(...this.getIndustrySuggestions(context))
    
    // Similar tag suggestions
    suggestions.push(...this.getSimilarTagSuggestions(context))
    
    // Trending suggestions
    suggestions.push(...this.getTrendingSuggestions(context))
    
    // Filter out already selected tags and duplicates
    const filtered = suggestions
      .filter(s => !context.currentTags.includes(s.value))
      .filter((s, i, arr) => arr.findIndex(x => x.value === s.value) === i)
      .slice(0, 12)
    
    return this.rankSuggestions(filtered, context)
  }

  private getRecruiterSuggestions(context: SuggestionContext): TagSuggestion[] {
    const input = context.inputText.toLowerCase()
    const recruiterTags = [
      { value: "Top Performer", label: "Top Performer", type: "team" as const, count: 89 },
      { value: "Culture Fit", label: "Culture Fit", type: "team" as const, count: 76 },
      { value: "Quick Hire", label: "Quick Hire", type: "team" as const, count: 54 },
      { value: "High Potential", label: "High Potential", type: "team" as const, count: 92 },
      { value: "Diverse Talent", label: "Diverse Talent", type: "team" as const, count: 67 },
    ]
    
    return recruiterTags.filter(tag => 
      tag.label.toLowerCase().includes(input) || 
      input === "" ||
      this.semanticMatch(input, tag.label)
    )
  }

  private getSeekerSuggestions(context: SuggestionContext): TagSuggestion[] {
    const input = context.inputText.toLowerCase()
    const seekerTags = [
      { value: "Job Alert", label: "Job Alert", type: "personal" as const, count: 234 },
      { value: "Salary Negotiable", label: "Salary Negotiable", type: "personal" as const, count: 156 },
      { value: "Remote Preferred", label: "Remote Preferred", type: "personal" as const, count: 189 },
      { value: "Career Change", label: "Career Change", type: "personal" as const, count: 98 },
      { value: "Immediate Start", label: "Immediate Start", type: "personal" as const, count: 145 },
    ]
    
    return seekerTags.filter(tag => 
      tag.label.toLowerCase().includes(input) || 
      input === "" ||
      this.semanticMatch(input, tag.label)
    )
  }

  private getIndustrySuggestions(context: SuggestionContext): TagSuggestion[] {
    const industryMap: Record<string, TagSuggestion[]> = {
      "technology": [
        { value: "Full Stack", label: "Full Stack", type: "global" as const, count: 445 },
        { value: "DevOps", label: "DevOps", type: "global" as const, count: 289 },
        { value: "AI/ML", label: "AI/ML", type: "global" as const, count: 356 },
        { value: "Cloud Native", label: "Cloud Native", type: "global" as const, count: 234 },
      ],
      "healthcare": [
        { value: "Clinical Experience", label: "Clinical Experience", type: "global" as const, count: 178 },
        { value: "Patient Care", label: "Patient Care", type: "global" as const, count: 156 },
        { value: "Medical Certification", label: "Medical Certification", type: "global" as const, count: 289 },
      ],
      "finance": [
        { value: "Risk Management", label: "Risk Management", type: "global" as const, count: 234 },
        { value: "Financial Analysis", label: "Financial Analysis", type: "global" as const, count: 198 },
        { value: "Compliance", label: "Compliance", type: "global" as const, count: 167 },
      ]
    }
    
    return industryMap[context.userContext.industry] || []
  }

  private getSimilarTagSuggestions(context: SuggestionContext): TagSuggestion[] {
    const input = context.inputText.toLowerCase()
    const similarityMap: Record<string, TagSuggestion[]> = {
      "react": [
        { value: "Vue.js", label: "Vue.js", type: "global" as const, count: 145 },
        { value: "Angular", label: "Angular", type: "global" as const, count: 167 },
        { value: "JavaScript", label: "JavaScript", type: "global" as const, count: 289 },
      ],
      "manager": [
        { value: "Team Lead", label: "Team Lead", type: "global" as const, count: 234 },
        { value: "Director", label: "Director", type: "global" as const, count: 156 },
        { value: "Executive", label: "Executive", type: "global" as const, count: 98 },
      ],
      "senior": [
        { value: "Lead", label: "Lead", type: "global" as const, count: 345 },
        { value: "Principal", label: "Principal", type: "global" as const, count: 189 },
        { value: "Expert", label: "Expert", type: "global" as const, count: 234 },
      ]
    }
    
    for (const [key, suggestions] of Object.entries(similarityMap)) {
      if (input.includes(key)) {
        return suggestions
      }
    }
    
    return []
  }

  private getTrendingSuggestions(context: SuggestionContext): TagSuggestion[] {
    return [
      { value: "AI Experienced", label: "AI Experienced", type: "global" as const, count: 567 },
      { value: "Hybrid Work", label: "Hybrid Work", type: "global" as const, count: 456 },
      { value: "Sustainability Focus", label: "Sustainability Focus", type: "global" as const, count: 234 },
      { value: "Data Driven", label: "Data Driven", type: "global" as const, count: 345 },
      { value: "Innovation Mindset", label: "Innovation Mindset", type: "global" as const, count: 289 },
    ]
  }

  private semanticMatch(input: string, tag: string): boolean {
    // Simplified semantic matching - in real implementation would use embeddings
    const synonyms: Record<string, string[]> = {
      "quick": ["fast", "rapid", "speedy"],
      "senior": ["experienced", "expert", "lead"],
      "junior": ["entry", "new", "fresh"],
      "remote": ["distributed", "virtual", "wfh"],
    }
    
    for (const [key, values] of Object.entries(synonyms)) {
      if (input.includes(key) && values.some(v => tag.toLowerCase().includes(v))) {
        return true
      }
    }
    
    return false
  }

  private rankSuggestions(suggestions: TagSuggestion[], context: SuggestionContext): TagSuggestion[] {
    return suggestions.sort((a, b) => {
      // Prioritize by relevance score
      const scoreA = this.calculateRelevanceScore(a, context)
      const scoreB = this.calculateRelevanceScore(b, context)
      
      if (scoreB !== scoreA) return scoreB - scoreA
      
      // Secondary sort by usage count
      return (b.count || 0) - (a.count || 0)
    })
  }

  private calculateRelevanceScore(suggestion: TagSuggestion, context: SuggestionContext): number {
    let score = 0
    
    // Recent usage boost
    if (context.userContext.recentTags.includes(suggestion.value)) {
      score += 10
    }
    
    // Type preference based on role
    if (context.userContext.role === "recruiter" && suggestion.type === "team") {
      score += 5
    } else if (context.userContext.role === "seeker" && suggestion.type === "personal") {
      score += 5
    }
    
    // Text match boost
    if (suggestion.label.toLowerCase().includes(context.inputText.toLowerCase())) {
      score += 8
    }
    
    // Usage frequency boost (normalized)
    score += Math.min((suggestion.count || 0) / 50, 5)
    
    return score
  }
}

// Duplicate detection engine
export class DuplicateDetectionEngine {
  static detectDuplicates(tags: Array<{id: string, name: string}>): Array<{id: string, duplicates: string[]}> {
    const duplicates: Array<{id: string, duplicates: string[]}> = []
    
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i]
      const potentialDuplicates: string[] = []
      
      for (let j = 0; j < tags.length; j++) {
        if (i === j) continue
        const otherTag = tags[j]
        
        if (this.areSimilar(tag.name, otherTag.name)) {
          potentialDuplicates.push(otherTag.name)
        }
      }
      
      if (potentialDuplicates.length > 0) {
        duplicates.push({
          id: tag.id,
          duplicates: potentialDuplicates
        })
      }
    }
    
    return duplicates
  }

  private static areSimilar(tag1: string, tag2: string): boolean {
    // Exact case-insensitive match
    if (tag1.toLowerCase() === tag2.toLowerCase()) return true
    
    // Common abbreviations
    const abbreviations: Record<string, string[]> = {
      "product manager": ["pm", "prod mgr", "product mgr"],
      "software engineer": ["swe", "software eng", "dev"],
      "user experience": ["ux", "user exp"],
      "user interface": ["ui"],
      "artificial intelligence": ["ai"],
      "machine learning": ["ml"],
      "full stack": ["full-stack", "fullstack"],
      "front end": ["frontend", "front-end", "fe"],
      "back end": ["backend", "back-end", "be"],
    }
    
    const tag1Lower = tag1.toLowerCase()
    const tag2Lower = tag2.toLowerCase()
    
    for (const [full, abbrevs] of Object.entries(abbreviations)) {
      if ((tag1Lower === full && abbrevs.includes(tag2Lower)) ||
          (tag2Lower === full && abbrevs.includes(tag1Lower))) {
        return true
      }
    }
    
    // Levenshtein distance for similar spellings
    const distance = this.levenshteinDistance(tag1Lower, tag2Lower)
    const maxLength = Math.max(tag1.length, tag2.length)
    const similarity = 1 - (distance / maxLength)
    
    return similarity > 0.8 && maxLength > 3 // 80% similarity threshold
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }
}