import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys, Constants } from 'librechat-data-provider';
import type { TMessage } from 'librechat-data-provider';
import { TooltipAnchor, Button } from '~/components/ui';
import { WorkflowIcon } from '~/components/svg';
import { useChatContext } from '~/Providers';
import { useLocalize } from '~/hooks';
import { useNavigate } from 'react-router-dom';

export default function HeaderNewWorkflow() {
  const localize = useLocalize();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { conversation, newConversation } = useChatContext();

  const clickHandler: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
      window.open('/w/new', '_blank');
      return;
    }
    queryClient.setQueryData<TMessage[]>(
      [QueryKeys.messages, conversation?.conversationId ?? Constants.NEW_CONVO],
      [],
    );
    queryClient.invalidateQueries([QueryKeys.messages]);
    newConversation();
    navigate('/w/new', { state: { focusWorkflow: true } });
  };

  return (
    <TooltipAnchor
      description={localize('com_ui_new_workflow')}
      render={
        <Button
          size="icon"
          variant="outline"
          data-testid="wide-header-new-workflow-button"
          aria-label={localize('com_ui_new_workflow')}
          className="rounded-xl border border-border-light bg-surface-secondary p-2 hover:bg-surface-hover max-md:hidden"
          onClick={clickHandler}
        >
          <WorkflowIcon />
        </Button>
      }
    />
  );
}