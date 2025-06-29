import { memo, useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Constants } from 'librechat-data-provider';
import type { TMessage } from 'librechat-data-provider';
import type { ChatFormValues } from '~/common';
import { ChatContext, AddedChatContext, useFileMapContext, ChatFormProvider } from '~/Providers';
import { useChatHelpers, useAddedResponse, useSSE } from '~/hooks';
import { useGetMessagesByConvoId } from '~/data-provider';
import MessagesView from '~/components/Chat/Messages/MessagesView';
import Presentation from '~/components/Chat/Presentation';
import ChatForm from '~/components/Chat/Input/ChatForm';
import Landing from '~/components/Chat/Landing';
import Header from '~/components/Chat/Header';
import Footer from '~/components/Chat/Footer';
import WorkflowAutomationPanel from './WorkflowAutomationPanel';
import { buildTree, cn } from '~/utils';
import { Spinner } from '~/components/svg';
import store from '~/store';

function LoadingSpinner() {
  return (
    <div className="relative flex-1 overflow-hidden overflow-y-auto">
      <div className="relative flex h-full items-center justify-center">
        <Spinner className="text-text-primary" />
      </div>
    </div>
  );
}

function WorkflowChatView({ index = 0 }: { index?: number }) {
  const { conversationId } = useParams();
  const rootSubmission = useRecoilValue(store.submissionByIndex(index));
  const addedSubmission = useRecoilValue(store.submissionByIndex(index + 1));
  const centerFormOnLanding = useRecoilValue(store.centerFormOnLanding);

  const fileMap = useFileMapContext();

  const { data: messagesTree = null, isLoading } = useGetMessagesByConvoId(conversationId ?? '', {
    select: useCallback(
      (data: TMessage[]) => {
        const dataTree = buildTree({ messages: data, fileMap });
        return dataTree?.length === 0 ? null : (dataTree ?? null);
      },
      [fileMap],
    ),
    enabled: !!fileMap,
  });

  const chatHelpers = useChatHelpers(index, conversationId);
  const addedChatHelpers = useAddedResponse({ rootIndex: index });

  useSSE(rootSubmission, chatHelpers, false);
  useSSE(addedSubmission, addedChatHelpers, true);

  const methods = useForm<ChatFormValues>({
    defaultValues: { text: '' },
  });

  let content: JSX.Element | null | undefined;
  const isLandingPage =
    (!messagesTree || messagesTree.length === 0) &&
    (conversationId === Constants.NEW_CONVO || !conversationId);
  const isNavigating = (!messagesTree || messagesTree.length === 0) && conversationId != null;

  if (isLoading && conversationId !== Constants.NEW_CONVO) {
    content = <LoadingSpinner />;
  } else if ((isLoading || isNavigating) && !isLandingPage) {
    content = <LoadingSpinner />;
  } else if (!isLandingPage) {
    // Show automation panel with conversation sidebar
    content = (
      <div className="flex h-full">
        <div className="flex-1">
          <WorkflowAutomationPanel />
        </div>
        {/* Show recent messages in a sidebar */}
        {messagesTree && messagesTree.length > 0 && (
          <div className="w-80 border-l border-border-light bg-surface-secondary p-4 overflow-y-auto">
            <h3 className="font-medium text-text-primary mb-3">Conversation</h3>
            <div className="space-y-2 text-sm">
              {messagesTree.slice(-3).map((message, index) => (
                <div key={message.messageId || index} className="p-2 rounded bg-surface-primary">
                  <div className="font-medium text-xs text-text-secondary mb-1">
                    {message.isCreatedByUser ? 'You' : 'Assistant'}
                  </div>
                  <div className="text-text-primary">
                    {message.text?.slice(0, 150)}
                    {message.text && message.text.length > 150 && '...'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } else {
    // Landing page - show automation panel
    content = <WorkflowAutomationPanel />;
  }

  return (
    <ChatFormProvider {...methods}>
      <ChatContext.Provider value={chatHelpers}>
        <AddedChatContext.Provider value={addedChatHelpers}>
          <Presentation>
            <div className="flex h-full w-full flex-col">
              {!isLoading && (
                <Header />
              )}
              <>
                <div
                  className={cn(
                    'flex flex-col',
                    isLandingPage
                      ? 'flex-1'
                      : 'h-full overflow-y-auto',
                  )}
                >
                  {content}
                </div>
              </>
              <Footer />
            </div>
          </Presentation>
        </AddedChatContext.Provider>
      </ChatContext.Provider>
    </ChatFormProvider>
  );
}

export default memo(WorkflowChatView);