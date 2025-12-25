import { useState, KeyboardEvent } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
  className?: string;
}

const defaultSuggestions = [
  'ضروری',
  'تفریحی',
  'اولویت بالا',
  'قسط',
  'یکبار مصرف',
  'خانواده',
  'کار',
  'شخصی',
];

export function TagInput({
  tags,
  onChange,
  placeholder = 'افزودن برچسب...',
  maxTags = 5,
  suggestions = defaultSuggestions,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag &&
      !tags.includes(trimmedTag) &&
      tags.length < maxTags
    ) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) =>
      !tags.includes(s) &&
      s.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className={cn('space-y-2', className)}>
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 text-xs py-1 px-2"
            >
              <Tag className="w-3 h-3" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      {tags.length < maxTags && (
        <div className="relative">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addTag(inputValue)}
              disabled={!inputValue.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
              {filteredSuggestions.slice(0, 5).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="w-full text-right px-3 py-2 hover:bg-accent text-sm transition-colors"
                  onMouseDown={() => addTag(suggestion)}
                >
                  <Tag className="w-3 h-3 inline-block ml-2 text-muted-foreground" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        {tags.length}/{maxTags} برچسب • Enter برای افزودن
      </p>
    </div>
  );
}
