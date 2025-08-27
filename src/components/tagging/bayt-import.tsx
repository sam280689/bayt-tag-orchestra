import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"
import { Upload, Plus, FileText, Download, ExternalLink } from "lucide-react"
import * as XLSX from 'xlsx'

interface BaytCandidate {
  name: string
  email: string
  profile_text?: string
  bayt_profile_url?: string
  location?: string
  experience?: string
  education?: string
}

interface BaytImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

export function BaytImportDialog({ isOpen, onClose, onImportComplete }: BaytImportDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("manual")
  
  // Manual form state
  const [manualForm, setManualForm] = useState<BaytCandidate>({
    name: "",
    email: "",
    profile_text: "",
    bayt_profile_url: "",
    location: "",
    experience: "",
    education: ""
  })

  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<BaytCandidate[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualForm.name || !manualForm.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Create profile text from Bayt data
      const profileText = [
        manualForm.profile_text,
        manualForm.location && `Location: ${manualForm.location}`,
        manualForm.experience && `Experience: ${manualForm.experience}`,
        manualForm.education && `Education: ${manualForm.education}`,
        manualForm.bayt_profile_url && `Bayt Profile: ${manualForm.bayt_profile_url}`
      ].filter(Boolean).join('\n\n')

      const { data: insertedCandidate, error } = await supabase
        .from('candidates')
        .insert({
          name: manualForm.name,
          email: manualForm.email,
          profile_text: profileText
        })
        .select('id')
        .single()

      if (error) throw error

      // Trigger workflow rules for auto-tagging
      if (insertedCandidate?.id) {
        try {
          const response = await supabase.functions.invoke('execute-workflow', {
            body: { 
              candidate_id: insertedCandidate.id,
              trigger_type: 'candidate_added'
            }
          })
          console.log('Workflow execution response:', response)
        } catch (workflowError) {
          console.error('Workflow execution failed:', workflowError)
          // Don't fail the import if workflow fails
        }
      }

      toast({
        title: "Success",
        description: "Candidate imported from Bayt successfully",
      })

      // Reset form
      setManualForm({
        name: "",
        email: "",
        profile_text: "",
        bayt_profile_url: "",
        location: "",
        experience: "",
        education: ""
      })
      
      onImportComplete()
      onClose()
    } catch (error: any) {
      console.error('Error importing candidate:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to import candidate",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        // Map the data to our candidate format
        const candidates: BaytCandidate[] = jsonData.map(row => ({
          name: row.Name || row.name || "",
          email: row.Email || row.email || "",
          profile_text: row.Profile || row.profile_text || row["Profile Text"] || "",
          bayt_profile_url: row.URL || row.url || row["Bayt URL"] || "",
          location: row.Location || row.location || "",
          experience: row.Experience || row.experience || "",
          education: row.Education || row.education || ""
        }))

        setCsvData(candidates)
        setShowPreview(true)
      } catch (error) {
        console.error('Error parsing file:', error)
        toast({
          title: "Error", 
          description: "Failed to parse the file. Please check the format.",
          variant: "destructive",
        })
      }
    }

    reader.readAsBinaryString(file)
  }

  const handleBulkImport = async () => {
    if (csvData.length === 0) return

    setLoading(true)
    try {
      const candidatesToInsert = csvData
        .filter(candidate => candidate.name && candidate.email)
        .map(candidate => {
          const profileText = [
            candidate.profile_text,
            candidate.location && `Location: ${candidate.location}`,
            candidate.experience && `Experience: ${candidate.experience}`,
            candidate.education && `Education: ${candidate.education}`,
            candidate.bayt_profile_url && `Bayt Profile: ${candidate.bayt_profile_url}`
          ].filter(Boolean).join('\n\n')

          return {
            name: candidate.name,
            email: candidate.email,
            profile_text: profileText
          }
        })

      const { data: insertedCandidates, error } = await supabase
        .from('candidates')
        .insert(candidatesToInsert)
        .select('id')

      if (error) throw error

      // Trigger workflow rules for each inserted candidate
      if (insertedCandidates && insertedCandidates.length > 0) {
        for (const candidate of insertedCandidates) {
          try {
            const response = await supabase.functions.invoke('execute-workflow', {
              body: { 
                candidate_id: candidate.id,
                trigger_type: 'candidate_added'
              }
            })
            console.log('Workflow execution response for candidate:', candidate.id, response)
          } catch (workflowError) {
            console.error('Workflow execution failed for candidate:', candidate.id, workflowError)
            // Don't fail the import if workflow fails
          }
        }
      }

      toast({
        title: "Success",
        description: `Successfully imported ${candidatesToInsert.length} candidates from Bayt`,
      })

      setCsvData([])
      setShowPreview(false)
      setCsvFile(null)
      onImportComplete()
      onClose()
    } catch (error: any) {
      console.error('Error importing candidates:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to import candidates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        Name: "John Doe",
        Email: "john@example.com",
        Profile: "Software Engineer with 5 years experience...",
        Location: "Dubai, UAE",
        Experience: "5 years in software development",
        Education: "Bachelor's in Computer Science",
        "Bayt URL": "https://www.bayt.com/en/profile/123456"
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bayt Import Template")
    XLSX.writeFile(workbook, "bayt_import_template.xlsx")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Candidates from Bayt</DialogTitle>
          <DialogDescription>
            Add candidates manually or import from a CSV/Excel file
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={manualForm.name}
                    onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                    placeholder="Candidate's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={manualForm.email}
                    onChange={(e) => setManualForm({...manualForm, email: e.target.value})}
                    placeholder="candidate@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bayt_url">Bayt Profile URL</Label>
                <Input
                  id="bayt_url"
                  value={manualForm.bayt_profile_url}
                  onChange={(e) => setManualForm({...manualForm, bayt_profile_url: e.target.value})}
                  placeholder="https://www.bayt.com/en/profile/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={manualForm.location}
                    onChange={(e) => setManualForm({...manualForm, location: e.target.value})}
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={manualForm.experience}
                    onChange={(e) => setManualForm({...manualForm, experience: e.target.value})}
                    placeholder="Years of experience"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={manualForm.education}
                  onChange={(e) => setManualForm({...manualForm, education: e.target.value})}
                  placeholder="Degree and field of study"
                />
              </div>

              <div>
                <Label htmlFor="profile">Profile Summary</Label>
                <Textarea
                  id="profile"
                  value={manualForm.profile_text}
                  onChange={(e) => setManualForm({...manualForm, profile_text: e.target.value})}
                  placeholder="Enter the candidate's profile summary or bio from Bayt..."
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Importing..." : "Import Candidate"}
                  <Plus className="h-4 w-4 ml-2" />
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            {!showPreview ? (
              <div className="space-y-4">
                <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <Label htmlFor="csv-upload" className="cursor-pointer">
                      <span className="text-sm font-medium">Upload CSV/Excel file</span>
                      <p className="text-xs text-muted-foreground">
                        Select a file containing candidate data from Bayt
                      </p>
                    </Label>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button type="button" variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Required columns:</strong> Name, Email</p>
                  <p><strong>Optional columns:</strong> Profile, Location, Experience, Education, Bayt URL</p>
                  <p>The template shows the expected format for your data.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Preview: {csvData.length} candidates found</h4>
                  <Badge variant="secondary">
                    {csvData.filter(c => c.name && c.email).length} valid entries
                  </Badge>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  <div className="space-y-2 p-4">
                    {csvData.slice(0, 5).map((candidate, index) => (
                      <div key={index} className="flex items-center gap-4 p-2 bg-muted/50 rounded">
                        <div className="flex-1">
                          <div className="font-medium">{candidate.name || "No name"}</div>
                          <div className="text-sm text-muted-foreground">{candidate.email || "No email"}</div>
                        </div>
                        {candidate.location && (
                          <Badge variant="outline">{candidate.location}</Badge>
                        )}
                      </div>
                    ))}
                    {csvData.length > 5 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        ... and {csvData.length - 5} more candidates
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowPreview(false)}>
                    Back to Upload
                  </Button>
                  <Button 
                    onClick={handleBulkImport} 
                    disabled={loading || csvData.filter(c => c.name && c.email).length === 0}
                  >
                    {loading ? "Importing..." : `Import ${csvData.filter(c => c.name && c.email).length} Candidates`}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}