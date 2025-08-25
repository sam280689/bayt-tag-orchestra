import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { TagInput } from '@/components/ui/tag-input';
import { Badge } from '@/components/ui/badge';
import { Plus, Star, Bookmark, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalTag {
  id: string;
  name: string;
  count: number;
  type: 'personal';
  lastUsed: string;
  color?: string;
}

interface PersonalTagsProps {
  className?: string;
}

export function PersonalTags({ className }: PersonalTagsProps) {
  const [personalTags, setPersonalTags] = useState<string[]>([
    'Senior Developer', 'Remote Work', 'Full Stack', 'React Expert'
  ]);

  const [recentTags] = useState<PersonalTag[]>([
    { id: '1', name: 'Senior Developer', count: 15, type: 'personal', lastUsed: '2 hours ago' },
    { id: '2', name: 'Remote Work', count: 8, type: 'personal', lastUsed: '1 day ago' },
    { id: '3', name: 'Full Stack', count: 12, type: 'personal', lastUsed: '3 days ago' },
    { id: '4', name: 'React Expert', count: 6, type: 'personal', lastUsed: '1 week ago' },
  ]);

  const [mostUsedTags] = useState<PersonalTag[]>([
    { id: '5', name: 'JavaScript', count: 34, type: 'personal', lastUsed: '1 hour ago' },
    { id: '6', name: 'Product Manager', count: 28, type: 'personal', lastUsed: '4 hours ago' },
    { id: '7', name: 'UI/UX Design', count: 22, type: 'personal', lastUsed: '1 day ago' },
    { id: '8', name: 'Team Lead', count: 19, type: 'personal', lastUsed: '2 days ago' },
  ]);

  const handleTagsChange = (newTags: string[]) => {
    setPersonalTags(newTags);
  };

  const handleCreateTag = (tagName: string) => {
    console.log('Creating personal tag:', tagName);
  };

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
                    {tag.count}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {tag.lastUsed}
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
                    {tag.count} uses
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
          <Button variant="outline" className="w-full justify-start">
            <Star className="h-4 w-4 mr-2" />
            Tag saved jobs
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Bookmark className="h-4 w-4 mr-2" />
            Organize searches
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Clock className="h-4 w-4 mr-2" />
            Review applications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}