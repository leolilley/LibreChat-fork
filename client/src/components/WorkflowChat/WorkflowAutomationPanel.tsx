import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Constants } from 'librechat-data-provider';
import { useChatContext } from '~/Providers';
import { useGetMessagesByConvoId } from '~/data-provider';
import WorkflowLibraryView from './WorkflowLibraryView';
import WorkflowButtonGrid from './WorkflowButtonGrid';
import { analyzeConversationState, extractThinkingContent } from '~/utils/workflowContext';
import { WORKFLOW_PROMPTS } from '~/utils/workflowPrompts';
import { buildTree } from '~/utils';
import { indexedTemplateService } from '~/utils/indexedTemplateService';
import type { Template } from '~/data-provider/Templates/types';

interface WorkflowState {
  currentStep: string;
  selectedWorkflow?: Template;
  availableActions: string[];
  resultData?: any;
  showingResults: boolean;
}

export default function WorkflowAutomationPanel() {
  const { conversationId } = useParams();
  const { conversation, submitMessage } = useChatContext();
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentStep: 'library',
    availableActions: [],
    showingResults: false,
  });

  // Get messages for this conversation
  const { data: messages = [] } = useGetMessagesByConvoId(conversationId ?? '', {
    enabled: conversationId !== Constants.NEW_CONVO,
  });

  // Analyze conversation state when messages change
  useEffect(() => {
    if (messages.length === 0) {
      // New conversation - show template library
      setWorkflowState({
        currentStep: 'library',
        availableActions: [],
        showingResults: false,
      });
      return;
    }

    // Analyze the latest messages to determine workflow state
    const messagesTree = buildTree({ messages, fileMap: {} });
    const latestMessage = messagesTree[messagesTree.length - 1];
    
    if (latestMessage && !latestMessage.isCreatedByUser) {
      // Analyze assistant's response for workflow context
      const analysisResult = analyzeConversationState(messagesTree);
      setWorkflowState(analysisResult);
    }
  }, [messages]);

  // Handle workflow prompt injection
  const injectWorkflowPrompt = useCallback((promptKey: string, context: any = {}) => {
    const prompt = WORKFLOW_PROMPTS[promptKey];
    if (!prompt) {
      console.error(`Workflow prompt not found: ${promptKey}`);
      return;
    }

    // Format prompt with context if needed
    const formattedPrompt = typeof prompt === 'function' ? prompt(context) : prompt;
    
    // Submit the prompt through the existing chat system
    submitMessage(formattedPrompt);
  }, [submitMessage]);


  // Handle workflow selection
  const handleWorkflowSelect = useCallback((workflow: Template) => {
    setWorkflowState(prev => ({ 
      ...prev, 
      selectedWorkflow: workflow,
      currentStep: 'workflow'
    }));
    
    // Generate and inject the workflow prompt
    const workflowPrompt = indexedTemplateService.generateTemplatePrompt(workflow);
    submitMessage(workflowPrompt);
  }, [submitMessage]);

  // Handle workflow action
  const handleWorkflowAction = useCallback((actionId: string, context: any = {}) => {
    injectWorkflowPrompt(actionId, context);
  }, [injectWorkflowPrompt]);

  // Handle returning to library
  const handleBackToLibrary = useCallback(() => {
    setWorkflowState({
      currentStep: 'library',
      availableActions: [],
      showingResults: false,
    });
  }, []);

  // Render appropriate interface based on workflow state
  const renderInterface = () => {
    // If conversation is empty or showing library, show template library
    if (workflowState.currentStep === 'library' || messages.length === 0) {
      return (
        <WorkflowLibraryView 
          onWorkflowSelect={handleWorkflowSelect}
        />
      );
    }

    // If we have available actions or are in a workflow, show dynamic buttons
    if (workflowState.availableActions.length > 0 || workflowState.currentStep === 'workflow') {
      return (
        <WorkflowButtonGrid
          workflowState={workflowState}
          onActionClick={handleWorkflowAction}
          onBackToCategories={handleBackToLibrary}
        />
      );
    }

    // Fallback - show template library
    return (
      <WorkflowLibraryView 
        onWorkflowSelect={handleWorkflowSelect}
      />
    );
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border-light p-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Workflow Library
        </h2>
        <p className="text-sm text-text-secondary">
          Browse and install workflows from n8n's free library
        </p>
      </div>

      {/* Main Interface */}
      <div className="p-4">
        {renderInterface()}
      </div>

      {/* Footer with helpful info */}
      {workflowState.currentStep !== 'library' && (
        <div className="border-t border-border-light p-4">
          <button
            onClick={handleBackToLibrary}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back to Workflow Library
          </button>
        </div>
      )}
    </div>
  );
}