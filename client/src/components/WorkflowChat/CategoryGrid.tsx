import { memo, useEffect, useState } from 'react';
import { Button } from '~/components/ui';
import { indexedTemplateService } from '~/utils/indexedTemplateService';
import { Spinner } from '~/components/svg';
import type { BusinessCategory } from '~/data-provider/Templates/types';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
  onShowCategories: () => void;
}


const CategoryCard = memo(({ category, onSelect }: { category: Category; onSelect: (id: string) => void }) => (
  <Button
    variant="outline"
    onClick={() => onSelect(category.id)}
    className="h-auto flex-col items-start p-6 text-left hover:bg-surface-hover transition-colors"
  >
    <div className="flex items-center justify-between w-full mb-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{category.icon}</span>
        <h3 className="font-semibold text-lg text-text-primary">{category.name}</h3>
      </div>
      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
        {category.count}
      </span>
    </div>
    
    <p className="text-text-secondary text-sm leading-relaxed">
      {category.description}
    </p>
  </Button>
));

CategoryCard.displayName = 'CategoryCard';

const CategoryGrid = memo(({ onCategorySelect, onShowCategories }: CategoryGridProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Get business-friendly categories with counts from indexed service
        const businessCategories = await indexedTemplateService.getBusinessCategories();
        setCategories(businessCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          description: cat.name, // Use name as description for now
          count: cat.count
        })));
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Fallback to static categories with 0 counts
        setCategories([
          { id: 'ai-automation', name: 'AI & Automation', icon: '🤖', description: 'AI & Automation', count: 0 },
          { id: 'marketing-growth', name: 'Marketing & Growth', icon: '📈', description: 'Marketing & Growth', count: 0 },
          { id: 'sales-crm', name: 'Sales & CRM', icon: '💼', description: 'Sales & CRM', count: 0 },
          { id: 'support-service', name: 'Support & Service', icon: '🎧', description: 'Support & Service', count: 0 },
          { id: 'finance-accounting', name: 'Finance & Accounting', icon: '💰', description: 'Finance & Accounting', count: 0 },
          { id: 'hr-operations', name: 'HR & Operations', icon: '👥', description: 'HR & Operations', count: 0 },
          { id: 'it-devops', name: 'IT & DevOps', icon: '⚙️', description: 'IT & DevOps', count: 0 },
          { id: 'product-design', name: 'Product & Design', icon: '🎨', description: 'Product & Design', count: 0 },
          { id: 'utilities-tools', name: 'Utilities & Tools', icon: '🔧', description: 'Utilities & Tools', count: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus('Triggering template sync...');
    
    try {
      await indexedTemplateService.triggerSync();
      setSyncStatus('Sync started! This may take a few moments...');
      
      // Poll for completion and reload categories
      const pollSync = async () => {
        try {
          const status = await indexedTemplateService.getSyncStatus();
          if (status.in_progress) {
            setSyncStatus(`Syncing templates... (${status.last_sync_templates || 0} templates found)`);
            setTimeout(pollSync, 2000);
          } else {
            setSyncStatus('Sync completed! Reloading categories...');
            // Clear cache before reloading to ensure fresh data
            indexedTemplateService.clearCache();
            // Reload categories
            const businessCategories = await indexedTemplateService.getBusinessCategories();
            setCategories(businessCategories.map(cat => ({
              id: cat.id,
              name: cat.name,
              icon: cat.icon,
              description: cat.name,
              count: cat.count
            })));
            setSyncStatus('');
            setSyncing(false);
          }
        } catch (error) {
          console.error('Failed to check sync status:', error);
          setSyncStatus('Sync completed, but status check failed. Try refreshing.');
          setSyncing(false);
        }
      };
      
      setTimeout(pollSync, 2000);
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      setSyncStatus('Failed to start sync. Is template-sync service running?');
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-2 text-text-primary" />
          <p className="text-text-secondary">Loading automation categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          🚀 Choose Your Automation
        </h2>
        <p className="text-text-secondary mb-4">
          Select a category to browse 2990+ free templates from n8n's library
        </p>
        
        {/* Sync Controls */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {syncing ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Syncing...
              </>
            ) : (
              <>
                🔄 Sync Templates
              </>
            )}
          </Button>
          
          {syncStatus && (
            <span className="text-sm text-text-secondary">
              {syncStatus}
            </span>
          )}
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onSelect={onCategorySelect}
          />
        ))}
      </div>

    </div>
  );
});

CategoryGrid.displayName = 'CategoryGrid';

export default CategoryGrid;