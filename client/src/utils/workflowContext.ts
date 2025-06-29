import { ContentTypes } from 'librechat-data-provider';
import type { TMessage } from 'librechat-data-provider';

export interface WorkflowState {
  currentStep: string;
  selectedCategory?: string;
  selectedWorkflow?: string;
  availableActions: string[];
  resultData?: any;
  showingResults: boolean;
}

/**
 * Extract thinking content from a message
 */
export function extractThinkingContent(message: TMessage): string {
  if (!message?.content) return '';
  
  for (const part of message.content) {
    if (part?.type === ContentTypes.THINK && 'think' in part) {
      return typeof part.think === 'string' ? part.think : part.think?.text || '';
    }
  }
  
  return '';
}

/**
 * Extract visible text content from a message
 */
export function extractTextContent(message: TMessage): string {
  if (!message?.content) return '';
  
  let textContent = '';
  for (const part of message.content) {
    if (part?.type === ContentTypes.TEXT && 'text' in part) {
      textContent += typeof part.text === 'string' ? part.text : part.text?.text || '';
    }
  }
  
  return textContent;
}

/**
 * Analyze conversation state to determine workflow context
 */
export function analyzeConversationState(messages: TMessage[]): WorkflowState {
  if (!messages || messages.length === 0) {
    return {
      currentStep: 'categories',
      availableActions: [],
      showingResults: false,
    };
  }

  const lastMessage = messages[messages.length - 1];
  const lastUserMessage = [...messages].reverse().find(m => m.isCreatedByUser);
  
  if (!lastMessage || lastMessage.isCreatedByUser) {
    return {
      currentStep: 'categories',
      availableActions: [],
      showingResults: false,
    };
  }

  const thinkingContent = extractThinkingContent(lastMessage);
  const textContent = extractTextContent(lastMessage);
  
  // Analyze thinking content for workflow context
  const workflowStep = parseWorkflowStep(thinkingContent, textContent);
  const availableActions = parseAvailableActions(textContent, thinkingContent);
  const resultData = parseResultData(textContent, thinkingContent);
  const selectedCategory = parseSelectedCategory(thinkingContent, messages);
  
  return {
    currentStep: workflowStep,
    selectedCategory,
    availableActions,
    resultData,
    showingResults: availableActions.length > 0 || !!resultData,
  };
}

/**
 * Parse workflow step from thinking and text content
 */
function parseWorkflowStep(thinkingContent: string, textContent: string): string {
  const thinking = thinkingContent.toLowerCase();
  const text = textContent.toLowerCase();
  
  // Check for specific workflow types in thinking content
  if (thinking.includes('linkedin prospect') || thinking.includes('find prospects')) {
    if (thinking.includes('executing') || thinking.includes('processing results')) {
      return 'linkedin-prospects-results';
    }
    return 'linkedin-prospects';
  }
  
  if (thinking.includes('email campaign') || thinking.includes('campaign creation')) {
    return 'email-campaign';
  }
  
  if (thinking.includes('data analysis') || thinking.includes('csv') || thinking.includes('excel')) {
    return 'data-analysis';
  }
  
  // Check for category selection in text
  if (text.includes('lead generation') && text.includes('available')) {
    return 'lead-generation-options';
  }
  
  if (text.includes('email marketing') && text.includes('available')) {
    return 'email-marketing-options';
  }
  
  if (text.includes('workflow automation') && text.includes('choose a category')) {
    return 'categories';
  }
  
  // Default based on content patterns
  if (text.includes('choose a category') || text.includes('which category')) {
    return 'categories';
  }
  
  return 'conversation';
}

/**
 * Parse available actions from message content
 */
function parseAvailableActions(textContent: string, thinkingContent: string): string[] {
  const actions: string[] = [];
  const text = textContent.toLowerCase();
  const thinking = thinkingContent.toLowerCase();
  
  // Look for result-based actions
  if (text.includes('found') && (text.includes('prospects') || text.includes('leads'))) {
    actions.push('email-campaign', 'export-crm', 'find-similar', 'lead-scoring');
  }
  
  // Look for email campaign actions
  if (text.includes('email') && (text.includes('template') || text.includes('campaign'))) {
    actions.push('launch-campaign', 'edit-templates', 'a-b-test', 'schedule-send');
  }
  
  // Look for data analysis actions
  if (text.includes('data') && (text.includes('processed') || text.includes('analyzed'))) {
    actions.push('export-report', 'create-dashboard', 'schedule-reports', 'analyze-trends');
  }
  
  // Look for category-specific actions in thinking
  if (thinking.includes('lead generation') && !actions.length) {
    actions.push('linkedin-prospects', 'competitor-analysis', 'event-research', 'lead-scoring');
  }
  
  if (thinking.includes('email marketing') && !actions.length) {
    actions.push('create-campaign', 'sequence-automation', 'a-b-testing', 'analytics-reporting');
  }
  
  return actions;
}

/**
 * Parse result data from message content
 */
function parseResultData(textContent: string, thinkingContent: string): any {
  const text = textContent.toLowerCase();
  
  // Look for prospect results
  const prospectMatch = text.match(/found (\d+) (?:linkedin )?prospects?/);
  if (prospectMatch) {
    return {
      type: 'prospects',
      count: parseInt(prospectMatch[1]),
      source: 'linkedin'
    };
  }
  
  // Look for email results
  const emailMatch = text.match(/created? (\d+) (?:email )?templates?/);
  if (emailMatch) {
    return {
      type: 'email_templates',
      count: parseInt(emailMatch[1])
    };
  }
  
  // Look for data processing results
  if (text.includes('processed') && (text.includes('records') || text.includes('rows'))) {
    const recordMatch = text.match(/(\d+) records?/);
    if (recordMatch) {
      return {
        type: 'data_processing',
        records: parseInt(recordMatch[1])
      };
    }
  }
  
  return null;
}

/**
 * Parse selected category from conversation history
 */
function parseSelectedCategory(thinkingContent: string, messages: TMessage[]): string | undefined {
  const thinking = thinkingContent.toLowerCase();
  
  // Check current thinking content
  if (thinking.includes('lead generation')) return 'lead-generation';
  if (thinking.includes('email marketing')) return 'email-marketing';
  if (thinking.includes('data analysis')) return 'data-analysis';
  if (thinking.includes('client management')) return 'client-management';
  if (thinking.includes('research')) return 'research';
  if (thinking.includes('process automation')) return 'process-automation';
  
  // Check recent user messages for category selection
  const recentUserMessages = messages
    .filter(m => m.isCreatedByUser)
    .slice(-3)
    .map(m => extractTextContent(m).toLowerCase());
    
  for (const userText of recentUserMessages) {
    if (userText.includes('lead generation')) return 'lead-generation';
    if (userText.includes('email marketing')) return 'email-marketing';
    if (userText.includes('data analysis')) return 'data-analysis';
    if (userText.includes('client management')) return 'client-management';
    if (userText.includes('research')) return 'research';
    if (userText.includes('process automation')) return 'process-automation';
  }
  
  return undefined;
}

/**
 * Generate action button configuration based on workflow state
 */
export function generateActionButtons(workflowState: WorkflowState) {
  const buttons = [];
  
  for (const action of workflowState.availableActions) {
    switch (action) {
      case 'email-campaign':
        buttons.push({
          id: 'email-campaign',
          label: 'Create Email Campaign',
          icon: '📧',
          description: 'Generate targeted email templates',
          context: workflowState.resultData
        });
        break;
        
      case 'export-crm':
        buttons.push({
          id: 'export-crm',
          label: 'Export to CRM',
          icon: '📊',
          description: 'Export results to your CRM system'
        });
        break;
        
      case 'find-similar':
        buttons.push({
          id: 'find-similar',
          label: 'Find Similar',
          icon: '🔍',
          description: 'Search for similar prospects'
        });
        break;
        
      case 'linkedin-prospects':
        buttons.push({
          id: 'linkedin-prospects',
          label: 'LinkedIn Prospects',
          icon: '🔍',
          description: 'Find targeted LinkedIn prospects'
        });
        break;
        
      case 'competitor-analysis':
        buttons.push({
          id: 'competitor-analysis',
          label: 'Competitor Analysis',
          icon: '📈',
          description: 'Analyze competitor followers'
        });
        break;
        
      default:
        // Generic button for unrecognized actions
        buttons.push({
          id: action,
          label: action.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          icon: '⚙️',
          description: `Execute ${action.replace(/-/g, ' ')} workflow`
        });
    }
  }
  
  return buttons;
}