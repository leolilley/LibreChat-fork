import { memo } from 'react';
import { Button } from '~/components/ui';
import Header from '~/components/Chat/Header';

interface WorkflowHeaderProps {
  viewMode: 'automation' | 'chat';
  setViewMode: (mode: 'automation' | 'chat') => void;
}

const WorkflowHeader = memo(({ viewMode, setViewMode }: WorkflowHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 flex h-14 w-full items-center justify-between bg-white p-2 font-semibold text-text-primary dark:bg-gray-800 border-b border-border-light">
      {/* Use the existing header but extend it */}
      <div className="flex items-center gap-4 flex-1">
        {/* Left side - reuse existing header logic */}
        <div className="flex items-center gap-2">
          <Header />
        </div>
      </div>

      {/* Right side - Mode Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex bg-surface-secondary rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === 'automation' ? 'default' : 'ghost'}
            onClick={() => setViewMode('automation')}
            className="text-xs px-3 py-1"
          >
            ⚙️ Automation
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'chat' ? 'default' : 'ghost'}
            onClick={() => setViewMode('chat')}
            className="text-xs px-3 py-1"
          >
            💬 Chat
          </Button>
        </div>
      </div>
    </div>
  );
});

WorkflowHeader.displayName = 'WorkflowHeader';

export default WorkflowHeader;