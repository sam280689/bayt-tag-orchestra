import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { TagInput } from '@/components/ui/tag-input';
import { Badge } from '@/components/ui/badge';
import { Plus, Star, Bookmark, Clock, User, Search, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PersonalTag {
  id: string;
  name: string;
  usage_count: number;
  type: 'personal' | 'team' | 'global';
  last_used: string;
  created_at: string;
}

interface PersonalTagsProps {
  className?: string;
}

export function PersonalTags({ className }: PersonalTagsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [personalTags, setPersonalTags] = useState<string[]>([]);
  const [recentTags, setRecentTags] = useState<PersonalTag[]>([]);
  const [mostUsedTags, setMostUsedTags] = useState<PersonalTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPersonalTags();
    }
  }, [user]);

  const fetchPersonalTags = async () => {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('*')
        .eq('created_by', user?.id)
        .eq('type', 'personal')
        .order('last_used', { ascending: false });

      if (error) throw error;

      const tagNames = tags?.map(tag => tag.name) || [];
      setPersonalTags(tagNames);
      
      // Set recent tags (last 4)
      setRecentTags(tags?.slice(0, 4).map(tag => ({
        ...tag,
        type: tag.type as 'personal' | 'team' | 'global'
      })) || []);
      
      // Set most used tags (sorted by usage_count)
      const sortedByUsage = [...(tags || [])].sort((a, b) => b.usage_count - a.usage_count);
      setMostUsedTags(sortedByUsage.slice(0, 4).map(tag => ({
        ...tag,
        type: tag.type as 'personal' | 'team' | 'global'
      })));
      
    } catch (error) {
      console.error('Error fetching personal tags:', error);
      toast({
        title: "Error",
        description: "Failed to load personal tags",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTagsChange = async (newTags: string[]) => {
    setPersonalTags(newTags);
    
    // Handle removed tags
    const removedTags = personalTags.filter(tag => !newTags.includes(tag));
    for (const tagName of removedTags) {
      try {
        await supabase
          .from('tags')
          .delete()
          .eq('name', tagName)
          .eq('created_by', user?.id)
          .eq('type', 'personal');
      } catch (error) {
        console.error('Error removing tag:', error);
      }
    }
    
    // Handle added tags
    const addedTags = newTags.filter(tag => !personalTags.includes(tag));
    for (const tagName of addedTags) {
      await handleCreateTag(tagName);
    }
    
    fetchPersonalTags();
  };

  const handleCreateTag = async (tagName: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .insert([{
          name: tagName,
          type: 'personal',
          created_by: user?.id,
          usage_count: 1
        }]);

      if (error) throw error;

      toast({
        title: "Tag Created",
        description: `Created personal tag "${tagName}"`,
      });
      
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive"
      });
    }
  };

  const formatLastUsed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const handleTagSavedJobs = async () => {
    try {
      // Create or find a "Saved Jobs" tag
      const savedJobsTag = "Saved Jobs";
      
      if (!personalTags.includes(savedJobsTag)) {
        await handleCreateTag(savedJobsTag);
        setPersonalTags(prev => [...prev, savedJobsTag]);
      }
      
      // Navigate to candidates page to apply tags
      navigate('/candidates');
      
      toast({
        title: "Ready to Tag Jobs",
        description: "Navigate to saved candidates and apply your personal tags",
      });
    } catch (error) {
      console.error('Error handling saved jobs:', error);
      toast({
        title: "Error",
        description: "Failed to setup saved jobs tagging",
        variant: "destructive"
      });
    }
  };

  const handleOrganizeSearches = async () => {
    try {
      // Create search organization tags
      const searchTags = ["Active Search", "Follow Up", "Interested"];
      
      for (const tagName of searchTags) {
        if (!personalTags.includes(tagName)) {
          await handleCreateTag(tagName);
        }
      }
      
      // Update personal tags
      const newTags = [...new Set([...personalTags, ...searchTags])];
      setPersonalTags(newTags);
      
      toast({
        title: "Search Organization Tags Created",
        description: "Added 'Active Search', 'Follow Up', and 'Interested' tags",
      });
      
      // Refresh the tag list
      fetchPersonalTags();
    } catch (error) {
      console.error('Error organizing searches:', error);
      toast({
        title: "Error",
        description: "Failed to create search organization tags",
        variant: "destructive"
      });
    }
  };

  const handleReviewApplications = async () => {
    try {
      // Create application review tags
      const reviewTags = ["Applied", "Interview Scheduled", "Pending Response", "Follow Up Needed"];
      
      for (const tagName of reviewTags) {
        if (!personalTags.includes(tagName)) {
          await handleCreateTag(tagName);
        }
      }
      
      // Update personal tags
      const newTags = [...new Set([...personalTags, ...reviewTags])];
      setPersonalTags(newTags);
      
      toast({
        title: "Application Review Tags Created",
        description: "Added application status tracking tags",
      });
      
      // Navigate to candidates to review applications
      navigate('/candidates');
      
      // Refresh the tag list
      fetchPersonalTags();
    } catch (error) {
      console.error('Error setting up application review:', error);
      toast({
        title: "Error",
        description: "Failed to create application review tags",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="space-y-6">Loading personal tags...</div>;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Quick Tag Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            My Personal Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TagInput
            value={personalTags}
            onChange={handleTagsChange}
            suggestions={[
              { value: 'JavaScript', label: 'JavaScript', type: 'personal', count: 34 },
              { value: 'Product Manager', label: 'Product Manager', type: 'personal', count: 28 },
              { value: 'Remote Work', label: 'Remote Work', type: 'personal', count: 15 },
            ]}
            placeholder="Add or search personal tags..."
            maxTags={10}
            className="w-full"
            onCreateTag={handleCreateTag}
          />
          
          <div className="flex flex-wrap gap-2">
            {personalTags.map((tag) => (
              <Tag
                key={tag}
                variant="personal"
                size="sm"
                removable
                onRemove={() => {
                  setPersonalTags(personalTags.filter(t => t !== tag));
                }}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recently Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                  <div className="flex items-center gap-3">
                    <Tag variant="personal" size="sm">
                      {tag.name}
                    </Tag>
                    <Badge variant="secondary" className="text-xs">
                      {tag.usage_count}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatLastUsed(tag.last_used || tag.created_at)}
                  </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Used Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Most Used Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mostUsedTags.map((tag, index) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {index + 1}
                  </div>
                  <Tag variant="personal" size="default">
                    {tag.name}
                  </Tag>
                </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {tag.usage_count} uses
                    </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!personalTags.includes(tag.name)) {
                        setPersonalTags([...personalTags, tag.name]);
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start hover:bg-primary/5"
            onClick={handleTagSavedJobs}
          >
            <Star className="h-4 w-4 mr-2" />
            Tag saved jobs
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start hover:bg-primary/5"
            onClick={handleOrganizeSearches}
          >
            <Search className="h-4 w-4 mr-2" />
            Organize searches
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start hover:bg-primary/5"
            onClick={handleReviewApplications}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Review applications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}