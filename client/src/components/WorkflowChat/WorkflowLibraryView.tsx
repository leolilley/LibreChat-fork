import { memo, useEffect, useState } from 'react';
import { Button } from '~/components/ui';
import { Spinner } from '~/components/svg';
import { indexedTemplateService } from '~/utils/indexedTemplateService';
import type { Template } from '~/data-provider/Templates/types';

interface WorkflowLibraryViewProps {
  onWorkflowSelect: (workflow: Template) => void;
}

const WorkflowCard = memo(({ 
  workflow, 
  onSelect 
}: { 
  workflow: Template; 
  onSelect: (workflow: Template) => void;
}) => (
  <div className="border border-border-light rounded-lg p-4 hover:bg-surface-hover transition-colors group cursor-pointer"
       onClick={() => onSelect(workflow)}>
    <div className="flex items-start justify-between mb-2">
      <h3 className="font-medium text-text-primary text-sm group-hover:text-blue-600 transition-colors">
        {workflow.name}
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">⚙️ {workflow.node_count}</span>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-300">
          Available
        </span>
      </div>
    </div>
    
    <p className="text-text-secondary text-xs leading-relaxed mb-3 line-clamp-2">
      {workflow.description}
    </p>
    
    <div className="flex flex-wrap gap-1 mb-2">
      {workflow.tags.slice(0, 3).map((tag, index) => (
        <span
          key={index}
          className="inline-block bg-surface-tertiary text-text-secondary text-xs px-2 py-1 rounded-md"
        >
          {tag}
        </span>
      ))}
      {workflow.tags.length > 3 && (
        <span className="text-xs text-text-secondary">
          +{workflow.tags.length - 3} more
        </span>
      )}
    </div>

    <div className="flex items-center justify-between">
      <div className="text-xs text-text-secondary">
        {workflow.our_metadata.difficulty} • {workflow.our_metadata.business_category.replace('-', ' ')}
      </div>
      {workflow.author && (
        <div className="text-xs text-text-secondary">
          by {workflow.author.username}
        </div>
      )}
    </div>
  </div>
));

WorkflowCard.displayName = 'WorkflowCard';

const WorkflowLibraryView = memo(({ onWorkflowSelect }: WorkflowLibraryViewProps) => {
  const [workflows, setWorkflows] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get most popular tags from workflows (limit to top 8)
  const tagCounts = workflows
    .flatMap(w => w.tags)
    .filter(tag => tag.length > 0)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const popularTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8) // Show only top 8 most popular tags
    .map(([tag]) => tag);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = !searchTerm || 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => workflow.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  useEffect(() => {
    loadAllWorkflows();
  }, []);

  const loadAllWorkflows = async () => {
    setLoading(true);
    try {
      // Get all workflows directly
      const allWorkflows = await indexedTemplateService.getAllTemplates(1000);
      
      console.log('Loaded workflows:', allWorkflows.length, 'workflows');
      console.log('Sample workflow tags:', allWorkflows[0]?.tags);
      
      setWorkflows(allWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus('Triggering workflow sync...');
    
    try {
      await indexedTemplateService.triggerSync();
      setSyncStatus('Sync started! This may take a few moments...');
      
      // Poll for completion and reload workflows
      const pollSync = async () => {
        try {
          const status = await indexedTemplateService.getSyncStatus();
          if (status.in_progress) {
            setSyncStatus(`Syncing workflows... (${status.last_sync_templates || 0} workflows found)`);
            setTimeout(pollSync, 2000);
          } else {
            setSyncStatus('Sync completed! Reloading workflows...');
            // Clear cache before reloading to ensure fresh data
            indexedTemplateService.clearCache();
            await loadAllWorkflows();
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
      setSyncStatus('Failed to start sync. Is workflow-sync service running?');
      setSyncing(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="relative space-y-6">
      {/* Header with Sync Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
                🔄 Sync Workflows
              </>
            )}
          </Button>
          
          {syncStatus && (
            <span className="text-sm text-text-secondary">
              {syncStatus}
            </span>
          )}
        </div>
        
        <div className="text-sm text-text-secondary">
          {filteredWorkflows.length} of {workflows.length} workflows
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tag Filters */}
        {popularTags.length > 0 && (
          <div>
            <div className="text-sm font-medium text-text-primary mb-2">Popular tags:</div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-surface-tertiary text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {tag} ({tagCounts[tag]})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Workflows Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Spinner className="mx-auto mb-2 text-text-primary" />
            <p className="text-text-secondary">Loading workflows...</p>
          </div>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {workflows.length === 0 ? 'No workflows found' : 'No workflows match your filters'}
          </h3>
          <p className="text-text-secondary mb-4">
            {workflows.length === 0 
              ? 'Click "Sync Workflows" to download workflows from n8n\'s library'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {workflows.length === 0 && (
            <Button onClick={handleSync} disabled={syncing} variant="default">
              🔄 Sync Workflows Now
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.n8n_id}
              workflow={workflow}
              onSelect={onWorkflowSelect}
            />
          ))}
        </div>
      )}

    </div>
  );
});

WorkflowLibraryView.displayName = 'WorkflowLibraryView';

export default WorkflowLibraryView;