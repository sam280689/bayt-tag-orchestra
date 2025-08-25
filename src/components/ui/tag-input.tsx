import * as React from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tag } from "@/components/ui/tag"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Plus, Hash, Users, User } from "lucide-react"

export interface TagSuggestion {
  value: string
  label: string
  type: "team" | "personal" | "global" | "recent"
  count?: number
}

export interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: TagSuggestion[]
  placeholder?: string
  maxTags?: number
  className?: string
  disabled?: boolean
  onCreateTag?: (tag: string) => void
}

export function TagInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder = "Add or search tags...",
  maxTags,
  className,
  disabled = false,
  onCreateTag,
}: TagInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = (selectedValue: string) => {
    if (!value.includes(selectedValue) && (!maxTags || value.length < maxTags)) {
      onChange([...value, selectedValue])
    }
    setInputValue("")
    setOpen(false)
  }

  const handleRemove = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleCreateNew = (newTag: string) => {
    if (!value.includes(newTag) && (!maxTags || value.length < maxTags)) {
      onChange([...value, newTag])
      onCreateTag?.(newTag)
    }
    setInputValue("")
    setOpen(false)
  }

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      !value.includes(suggestion.value) &&
      suggestion.label.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, 7)

  const groupedSuggestions = {
    team: filteredSuggestions.filter(s => s.type === "team"),
    recent: filteredSuggestions.filter(s => s.type === "recent"),
    global: filteredSuggestions.filter(s => s.type === "global"),
  }

  const getTagVariant = (tag: string) => {
    const suggestion = suggestions.find(s => s.value === tag)
    switch (suggestion?.type) {
      case "team": return "team"
      case "personal": return "personal"
      default: return "default"
    }
  }

  const getGroupIcon = (type: string) => {
    switch (type) {
      case "team": return <Users className="h-3 w-3" />
      case "recent": return <Hash className="h-3 w-3" />
      case "global": return <Hash className="h-3 w-3" />
      default: return <Hash className="h-3 w-3" />
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Tags with Screen Reader Support */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2" id="selected-tags" aria-label="Selected tags">
          {value.map((tag) => (
            <Tag
              key={tag}
              variant={getTagVariant(tag)}
              removable
              onRemove={() => handleRemove(tag)}
              disabled={disabled}
              aria-label={`Remove ${tag} tag`}
            >
              {tag}
            </Tag>
          ))}
        </div>
      )}

      {/* Tag Input with Enhanced Accessibility */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Command className="overflow-visible bg-transparent">
              <CommandInput
                placeholder={maxTags && value.length >= maxTags 
                  ? `Maximum ${maxTags} tags reached` 
                  : placeholder
                }
                value={inputValue}
                onValueChange={setInputValue}
                onFocus={() => setOpen(true)}
                disabled={disabled || (maxTags && value.length >= maxTags)}
                className="border-input min-h-[44px] focus:ring-2 focus:ring-primary focus:border-primary"
                aria-label="Tag input field"
                aria-describedby={value.length > 0 ? "selected-tags" : undefined}
              />
            </Command>
          </div>
        </PopoverTrigger>
        {open && inputValue.length > 0 && (
          <PopoverContent 
            className="w-full p-0 bg-background border z-50 shadow-lg" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList className="max-h-64" role="listbox" aria-label="Tag suggestions">
                {filteredSuggestions.length === 0 ? (
                  <CommandEmpty className="py-6 text-center text-sm">
                    <div className="space-y-2">
                      <p>No matches found</p>
                      {inputValue.trim() && (
                        <button
                          onClick={() => handleCreateNew(inputValue.trim())}
                          className="inline-flex items-center gap-2 text-xs text-primary hover:underline focus:ring-2 focus:ring-primary focus:outline-none rounded px-2 py-1"
                          aria-label={`Create new tag "${inputValue.trim()}"`}
                        >
                          <Plus className="h-3 w-3" />
                          Create "{inputValue.trim()}"
                        </button>
                      )}
                    </div>
                  </CommandEmpty>
                ) : (
                  <>
                    {Object.entries(groupedSuggestions).map(([type, items]) => 
                      items.length > 0 && (
                        <CommandGroup key={type} heading={
                          <div className="flex items-center gap-2 capitalize">
                            {getGroupIcon(type)}
                            {type === "team" ? "Team Tags" : type === "recent" ? "Recently Used" : "Popular on Bayt"}
                          </div>
                        }>
                          {items.map((suggestion) => (
                            <CommandItem
                              key={suggestion.value}
                              value={suggestion.value}
                              onSelect={handleSelect}
                              className="flex items-center justify-between"
                            >
                              <span>{suggestion.label}</span>
                              {suggestion.count && (
                                <Badge variant="secondary" className="ml-2">
                                  {suggestion.count}
                                </Badge>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )
                    )}
                    {inputValue.trim() && !filteredSuggestions.find(s => s.value === inputValue.trim()) && (
                      <CommandGroup>
                        <CommandItem
                          value={inputValue.trim()}
                          onSelect={() => handleCreateNew(inputValue.trim())}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-3 w-3" />
                          Create "{inputValue.trim()}"
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  )
}