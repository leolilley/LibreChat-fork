import type { FC } from 'react';
import { useState } from 'react';
import { Workflow } from 'lucide-react';
import { Content, Portal, Root, Trigger } from '@radix-ui/react-popover';
import { useLocalize } from '~/hooks';
import { TooltipAnchor, Dialog, DialogTrigger, DialogContent, DialogTitle } from '~/components';
import { Button } from '~/components/ui';
import { Spinner } from '~/components/svg';
import { indexedTemplateService } from '~/utils/indexedTemplateService';
import WorkflowLibraryView from '~/components/WorkflowChat/WorkflowLibraryView';
import type { Template } from '~/data-provider/Templates/types';

const WorkflowLibraryMenu: FC = () => {
  const localize = useLocalize();
  const [isOpen, setIsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleWorkflowSelect = (workflow: Template) => {
    console.log('Selected workflow:', workflow);
    // TODO: Handle workflow selection - maybe inject into current chat
    setIsOpen(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus('Triggering workflow sync...');
    
    try {
      await indexedTemplateService.triggerSync();
      setSyncStatus('Sync started! This may take a few moments...');
      
      // Poll for completion
      const pollSync = async () => {
        try {
          const status = await indexedTemplateService.getSyncStatus();
          if (status.in_progress) {
            setSyncStatus(`Syncing workflows... (${status.last_sync_templates || 0} workflows found)`);
            setTimeout(pollSync, 2000);
          } else {
            setSyncStatus('Sync completed!');
            // Clear cache and trigger refresh
            indexedTemplateService.clearCache();
            setRefreshTrigger(prev => prev + 1);
            setTimeout(() => {
              setSyncStatus('');
              setSyncing(false);
            }, 2000);
          }
        } catch (error) {
          console.error('Failed to check sync status:', error);
          setSyncStatus('Sync completed, but status check failed.');
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <TooltipAnchor
          id="workflow-library-button"
          aria-label="Workflow Library"
          description="Browse workflow templates"
          tabIndex={0}
          role="button"
          data-testid="workflow-library-button"
          className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50"
        >
          <Workflow size={16} aria-label="Workflow Library Icon" />
        </TooltipAnchor>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="border-b border-border-light p-6 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-text-primary mb-2">
              🚀 Workflow Library
            </DialogTitle>
            <p className="text-text-secondary mb-4">
              Browse and discover 2990+ free automation templates from n8n's community library
            </p>
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
                  'Sync Workflows'
                )}
              </Button>
              {syncStatus && (
                <span className="text-sm text-text-secondary">
                  {syncStatus}
                </span>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            <WorkflowLibraryView onWorkflowSelect={handleWorkflowSelect} showHeader={false} refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowLibraryMenu;