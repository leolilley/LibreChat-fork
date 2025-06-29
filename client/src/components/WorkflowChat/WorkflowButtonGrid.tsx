import { memo } from 'react';
import { Button } from '~/components/ui';
import { generateActionButtons, type WorkflowState } from '~/utils/workflowContext';

interface WorkflowButtonGridProps {
  workflowState: WorkflowState;
  onActionClick: (actionId: string, context?: any) => void;
  onBackToCategories: () => void;
}

interface ActionButton {
  id: string;
  label: string;
  icon: string;
  description: string;
  context?: any;
}

const ActionButtonCard = memo(({ 
  button, 
  onClick 
}: { 
  button: ActionButton; 
  onClick: (id: string, context?: any) => void;
}) => (
  <Button
    variant="outline"
    onClick={() => onClick(button.id, button.context)}
    className="h-auto flex-col items-start p-4 text-left hover:bg-surface-hover transition-colors group"
  >
    <div className="flex items-center gap-3 mb-2 w-full">
      <span className="text-xl">{button.icon}</span>
      <h3 className="font-medium text-text-primary group-hover:text-text-primary">
        {button.label}
      </h3>
    </div>
    
    <p className="text-text-secondary text-sm leading-relaxed">
      {button.description}
    </p>
    
    {button.context && (
      <div className="mt-2 text-xs text-text-secondary bg-surface-tertiary px-2 py-1 rounded">
        {button.context.count && `${button.context.count} items`}
        {button.context.type && ` • ${button.context.type}`}
      </div>
    )}
  </Button>
));

ActionButtonCard.displayName = 'ActionButtonCard';

const WorkflowButtonGrid = memo(({ 
  workflowState, 
  onActionClick, 
  onBackToCategories 
}: WorkflowButtonGridProps) => {
  const actionButtons = generateActionButtons(workflowState);

  // If no actions available, show a message
  if (actionButtons.length === 0) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-surface-secondary rounded-lg p-6 max-w-md mx-auto">
          <h3 className="font-medium text-text-primary mb-2">
            💬 Continue the conversation
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            I'm ready to help! You can either describe what you need, or choose 
            from the options above in the chat.
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={onBackToCategories}
          className="mt-4"
        >
          ← Browse All Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      {workflowState.resultData && (
        <div className="bg-surface-secondary rounded-lg p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-500">✅</span>
            <h3 className="font-medium text-text-primary">
              {workflowState.resultData.type === 'prospects' && 'Prospects Found'}
              {workflowState.resultData.type === 'email_templates' && 'Templates Created'}
              {workflowState.resultData.type === 'data_processing' && 'Data Processed'}
            </h3>
          </div>
          <p className="text-sm text-text-secondary">
            {workflowState.resultData.count && `${workflowState.resultData.count} `}
            {workflowState.resultData.type === 'prospects' && 'qualified prospects ready for outreach'}
            {workflowState.resultData.type === 'email_templates' && 'email templates ready for your campaign'}
            {workflowState.resultData.type === 'data_processing' && 'records processed and analyzed'}
          </p>
        </div>
      )}

      {/* Action Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          🚀 Next Actions
        </h3>
        <p className="text-text-secondary text-sm">
          Choose what you'd like to do next, or continue the conversation
        </p>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actionButtons.map((button) => (
          <ActionButtonCard
            key={button.id}
            button={button}
            onClick={onActionClick}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToCategories}
          className="text-text-secondary hover:text-text-primary"
        >
          🏠 Browse Categories
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onActionClick('custom-request')}
          className="text-text-secondary hover:text-text-primary"
        >
          💬 Custom Request
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <div className="bg-surface-tertiary rounded-lg p-3 max-w-lg mx-auto">
          <p className="text-xs text-text-secondary leading-relaxed">
            💡 <strong>Tip:</strong> You can also type your request in the chat below, 
            or ask me to explain any of these workflows before running them.
          </p>
        </div>
      </div>
    </div>
  );
});

WorkflowButtonGrid.displayName = 'WorkflowButtonGrid';

export default WorkflowButtonGrid;