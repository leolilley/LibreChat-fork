import { memo } from 'react';
import { Button } from '~/components/ui';
import { Spinner } from '~/components/svg';
import type { Template } from '~/data-provider/Templates/types';
import { indexedTemplateService } from '~/utils/indexedTemplateService';

interface TemplateGridProps {
  categoryId?: string;
  templates: Template[];
  loading: boolean;
  onTemplateSelect: (template: Template) => void;
  onBackToCategories: () => void;
}

const TemplateCard = memo(({ 
  template, 
  onSelect 
}: { 
  template: Template; 
  onSelect: (template: Template) => void;
}) => {
  const handleClick = () => {
    window.open(`https://n8n.io/workflows/${template.n8n_id}/`, '_blank');
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className="h-auto flex-col items-start p-4 text-left hover:bg-surface-hover transition-colors group"
      title="Click to view template on n8n.io"
    >
    <div className="flex items-start justify-between w-full mb-2">
      <h3 className="font-medium text-text-primary group-hover:text-text-primary text-sm font-semibold">
        {template.name}
      </h3>
      <div className="flex items-center gap-1 text-xs text-text-secondary">
        <span>⚙️ {template.node_count}</span>
      </div>
    </div>
    
    <p className="text-text-secondary text-xs leading-relaxed mb-3 line-clamp-3">
      {template.description}
    </p>
    
    <div className="flex flex-wrap gap-1 mb-2">
      {template.categories.slice(0, 3).map((category, index) => (
        <span
          key={index}
          className="inline-block bg-surface-tertiary text-text-secondary text-xs px-2 py-1 rounded-md"
        >
          {category.name}
        </span>
      ))}
      {template.categories.length > 3 && (
        <span className="text-xs text-text-secondary">
          +{template.categories.length - 3} more
        </span>
      )}
    </div>

    {template.author && (
      <div className="text-xs text-text-secondary">
        by {template.author.username}
      </div>
    )}
  </Button>
  );
});

TemplateCard.displayName = 'TemplateCard';

const TemplateGrid = memo(({ 
  categoryId, 
  templates, 
  loading, 
  onTemplateSelect, 
  onBackToCategories 
}: TemplateGridProps) => {
  const categoryName = categoryId ? categoryId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Templates';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-2 text-text-primary" />
          <p className="text-text-secondary">Loading {categoryName.toLowerCase()} templates...</p>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            🎯 {categoryName}
          </h2>
          <p className="text-text-secondary mb-4">
            No templates found for this category
          </p>
          <Button onClick={onBackToCategories} variant="outline">
            ← Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-1">
            🎯 {categoryName}
          </h2>
          <p className="text-text-secondary text-sm">
            {templates.length} template{templates.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button onClick={onBackToCategories} variant="ghost" size="sm">
          ← Categories
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={onTemplateSelect}
          />
        ))}
      </div>


      {/* Popular Actions */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToCategories}
          className="text-text-secondary hover:text-text-primary"
        >
          🏠 Browse Other Categories
        </Button>
      </div>
    </div>
  );
});

TemplateGrid.displayName = 'TemplateGrid';

export default TemplateGrid;