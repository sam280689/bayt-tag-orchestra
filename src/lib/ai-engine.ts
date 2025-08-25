// Advanced AI Engine for Phase 3
export interface ContentAnalysis {
  keywords: string[]
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  categories: string[]
  entities: Array<{
    text: string
    type: "person" | "organization" | "location" | "skill" | "role"
    confidence: number
  }>
}

export interface TagRecommendation {
  tag: string
  confidence: number
  reason: string
  category: "skill" | "role" | "experience" | "industry" | "soft_skill"
  source: "ai_analysis" | "pattern_matching" | "semantic_similarity"
}

export interface AutoTaggingRule {
  id: string
  name: string
  condition: {
    field: "title" | "description" | "experience" | "skills"
    operator: "contains" | "equals" | "starts_with" | "regex"
    value: string
  }
  action: {
    type: "add_tag" | "remove_tag" | "set_category"
    tags: string[]
  }
  enabled: boolean
  priority: number
}

export class AdvancedAIEngine {
  private static instance: AdvancedAIEngine
  
  private constructor() {}
  
  static getInstance(): AdvancedAIEngine {
    if (!AdvancedAIEngine.instance) {
      AdvancedAIEngine.instance = new AdvancedAIEngine()
    }
    return AdvancedAIEngine.instance
  }

  // AI-powered content analysis
  async analyzeContent(content: string): Promise<ContentAnalysis> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const words = content.toLowerCase().split(/\s+/)
    
    // Extract keywords using TF-IDF simulation
    const keywords = this.extractKeywords(words)
    
    // Sentiment analysis simulation
    const sentiment = this.analyzeSentiment(words)
    
    // Category classification
    const categories = this.classifyContent(words)
    
    // Named entity recognition
    const entities = this.extractEntities(content)
    
    return {
      keywords,
      sentiment: sentiment.label,
      confidence: sentiment.confidence,
      categories,
      entities
    }
  }

  // Generate AI-powered tag recommendations
  async generateTagRecommendations(
    content: string,
    existingTags: string[] = [],
    context?: {
      role?: string
      industry?: string
      experience?: string
    }
  ): Promise<TagRecommendation[]> {
    const analysis = await this.analyzeContent(content)
    const recommendations: TagRecommendation[] = []
    
    // Skill-based recommendations
    for (const keyword of analysis.keywords) {
      if (this.isSkillKeyword(keyword)) {
        recommendations.push({
          tag: this.formatSkillTag(keyword),
          confidence: 0.85,
          reason: `Identified "${keyword}" as a relevant skill`,
          category: "skill",
          source: "ai_analysis"
        })
      }
    }
    
    // Role-based recommendations
    if (context?.role) {
      const roleRecommendations = this.getRoleBasedTags(context.role)
      recommendations.push(...roleRecommendations)
    }
    
    // Experience level recommendations
    const experienceLevel = this.inferExperienceLevel(content)
    if (experienceLevel) {
      recommendations.push({
        tag: experienceLevel,
        confidence: 0.75,
        reason: "Inferred from content and context",
        category: "experience",
        source: "pattern_matching"
      })
    }
    
    // Industry-specific recommendations
    if (context?.industry) {
      const industryTags = this.getIndustryTags(context.industry)
      recommendations.push(...industryTags)
    }
    
    // Soft skills based on sentiment and content
    const softSkills = this.inferSoftSkills(analysis)
    recommendations.push(...softSkills)
    
    // Filter out existing tags and sort by confidence
    return recommendations
      .filter(rec => !existingTags.includes(rec.tag))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10)
  }

  // Cluster similar tags using semantic analysis
  clusterTags(tags: Array<{id: string, name: string}>): Array<{
    cluster: string
    tags: Array<{id: string, name: string}>
    similarity: number
  }> {
    const clusters: Array<{
      cluster: string
      tags: Array<{id: string, name: string}>
      similarity: number
    }> = []
    
    // Group by semantic similarity
    const skillTags = tags.filter(t => this.isSkillKeyword(t.name.toLowerCase()))
    if (skillTags.length > 0) {
      clusters.push({
        cluster: "Technical Skills",
        tags: skillTags,
        similarity: 0.85
      })
    }
    
    const roleTags = tags.filter(t => this.isRoleKeyword(t.name.toLowerCase()))
    if (roleTags.length > 0) {
      clusters.push({
        cluster: "Job Roles",
        tags: roleTags,
        similarity: 0.82
      })
    }
    
    const experienceTags = tags.filter(t => this.isExperienceKeyword(t.name.toLowerCase()))
    if (experienceTags.length > 0) {
      clusters.push({
        cluster: "Experience Level",
        tags: experienceTags,
        similarity: 0.90
      })
    }
    
    return clusters
  }

  private extractKeywords(words: string[]): string[] {
    // Simulate TF-IDF keyword extraction
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
    const wordFreq: Record<string, number> = {}
    
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 2) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    })
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
  }

  private analyzeSentiment(words: string[]): {label: "positive" | "negative" | "neutral", confidence: number} {
    const positiveWords = ['excellent', 'great', 'good', 'amazing', 'outstanding', 'skilled', 'experienced', 'expert']
    const negativeWords = ['poor', 'bad', 'terrible', 'awful', 'inexperienced', 'lacking']
    
    let positiveScore = 0
    let negativeScore = 0
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++
      if (negativeWords.includes(word)) negativeScore++
    })
    
    const total = positiveScore + negativeScore
    if (total === 0) return { label: "neutral", confidence: 0.6 }
    
    if (positiveScore > negativeScore) {
      return { label: "positive", confidence: Math.min(0.95, 0.6 + (positiveScore / total) * 0.35) }
    } else if (negativeScore > positiveScore) {
      return { label: "negative", confidence: Math.min(0.95, 0.6 + (negativeScore / total) * 0.35) }
    }
    
    return { label: "neutral", confidence: 0.7 }
  }

  private classifyContent(words: string[]): string[] {
    const categories: string[] = []
    
    if (words.some(w => ['react', 'vue', 'angular', 'javascript'].includes(w))) {
      categories.push('Frontend Development')
    }
    if (words.some(w => ['node', 'python', 'java', 'backend'].includes(w))) {
      categories.push('Backend Development')
    }
    if (words.some(w => ['design', 'ui', 'ux', 'figma'].includes(w))) {
      categories.push('Design')
    }
    if (words.some(w => ['manager', 'lead', 'director', 'management'].includes(w))) {
      categories.push('Management')
    }
    
    return categories
  }

  private extractEntities(content: string): Array<{text: string, type: "person" | "organization" | "location" | "skill" | "role", confidence: number}> {
    const entities: Array<{text: string, type: "person" | "organization" | "location" | "skill" | "role", confidence: number}> = []
    
    // Simple regex-based entity extraction
    const skillPattern = /\b(React|Vue|Angular|Python|Java|JavaScript|TypeScript|Node\.js|MongoDB|PostgreSQL)\b/gi
    const rolePattern = /\b(Developer|Engineer|Manager|Designer|Analyst|Architect|Lead|Director)\b/gi
    const locationPattern = /\b(Dubai|Abu Dhabi|Riyadh|Cairo|Amman|Beirut|Kuwait|Doha)\b/gi
    
    let match
    while ((match = skillPattern.exec(content)) !== null) {
      entities.push({
        text: match[0],
        type: "skill",
        confidence: 0.9
      })
    }
    
    while ((match = rolePattern.exec(content)) !== null) {
      entities.push({
        text: match[0],
        type: "role",
        confidence: 0.85
      })
    }
    
    while ((match = locationPattern.exec(content)) !== null) {
      entities.push({
        text: match[0],
        type: "location",
        confidence: 0.95
      })
    }
    
    return entities
  }

  private isSkillKeyword(word: string): boolean {
    const skills = [
      'react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'java', 
      'node', 'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'docker', 
      'kubernetes', 'git', 'figma', 'photoshop', 'illustrator'
    ]
    return skills.includes(word.toLowerCase())
  }

  private isRoleKeyword(word: string): boolean {
    const roles = [
      'developer', 'engineer', 'manager', 'designer', 'analyst', 'architect',
      'lead', 'director', 'consultant', 'specialist', 'coordinator'
    ]
    return roles.some(role => word.toLowerCase().includes(role))
  }

  private isExperienceKeyword(word: string): boolean {
    const experience = ['junior', 'senior', 'lead', 'principal', 'entry', 'experienced', 'expert']
    return experience.some(exp => word.toLowerCase().includes(exp))
  }

  private formatSkillTag(skill: string): string {
    const skillMap: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'react': 'React',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'node': 'Node.js',
      'mongodb': 'MongoDB',
      'postgresql': 'PostgreSQL'
    }
    return skillMap[skill.toLowerCase()] || skill
  }

  private getRoleBasedTags(role: string): TagRecommendation[] {
    const roleMap: Record<string, string[]> = {
      'developer': ['Problem Solving', 'Code Review', 'Debugging', 'Version Control'],
      'manager': ['Team Leadership', 'Project Management', 'Strategic Planning', 'Communication'],
      'designer': ['Creative Thinking', 'User Research', 'Prototyping', 'Visual Design']
    }
    
    const tags = roleMap[role.toLowerCase()] || []
    return tags.map(tag => ({
      tag,
      confidence: 0.8,
      reason: `Common skill for ${role} role`,
      category: "soft_skill" as const,
      source: "pattern_matching" as const
    }))
  }

  private inferExperienceLevel(content: string): string | null {
    const content_lower = content.toLowerCase()
    
    if (content_lower.includes('senior') || content_lower.includes('lead') || content_lower.includes('5+ years')) {
      return 'Senior Level'
    }
    if (content_lower.includes('junior') || content_lower.includes('entry') || content_lower.includes('fresh graduate')) {
      return 'Junior Level'
    }
    if (content_lower.includes('mid') || content_lower.includes('2-4 years')) {
      return 'Mid Level'
    }
    
    return null
  }

  private getIndustryTags(industry: string): TagRecommendation[] {
    const industryMap: Record<string, string[]> = {
      'technology': ['Agile', 'Digital Transformation', 'Innovation', 'Scalability'],
      'finance': ['Risk Management', 'Compliance', 'Financial Analysis', 'Regulatory'],
      'healthcare': ['Patient Care', 'Medical Standards', 'HIPAA Compliance', 'Clinical Research']
    }
    
    const tags = industryMap[industry.toLowerCase()] || []
    return tags.map(tag => ({
      tag,
      confidence: 0.75,
      reason: `Relevant to ${industry} industry`,
      category: "industry" as any,
      source: "pattern_matching" as const
    }))
  }

  private inferSoftSkills(analysis: ContentAnalysis): TagRecommendation[] {
    const recommendations: TagRecommendation[] = []
    
    if (analysis.sentiment === "positive") {
      recommendations.push({
        tag: "Positive Attitude",
        confidence: 0.7,
        reason: "Positive sentiment detected in content",
        category: "soft_skill",
        source: "ai_analysis"
      })
    }
    
    if (analysis.keywords.some(k => ['team', 'collaboration', 'together'].includes(k))) {
      recommendations.push({
        tag: "Team Player",
        confidence: 0.8,
        reason: "Collaboration keywords detected",
        category: "soft_skill",
        source: "ai_analysis"
      })
    }
    
    return recommendations
  }
}