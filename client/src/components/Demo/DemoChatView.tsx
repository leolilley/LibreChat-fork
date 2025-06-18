import React, { useState, useEffect, useRef } from 'react';
import {
  BookCopy,
  PlusCircle,
  MessageCircleDashed,
  Settings2,
  Globe,
  Mic,
  ChevronDown,
} from 'lucide-react';
import { Constants } from 'librechat-data-provider';
import { Sidebar, NewChatIcon, AttachmentIcon, SendIcon } from '~/components/svg';
import MCPIcon from '~/components/ui/MCPIcon';
import { TooltipAnchor, Button, TextareaAutosize } from '~/components/ui';
import { useLocalize } from '~/hooks';
import { useGetStartupConfig } from '~/data-provider';

export default function DemoChatView() {
  const localize = useLocalize();
  const { data: config } = useGetStartupConfig();

  // Add CSS animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Profession selection state
  const [selectedProfession, setSelectedProfession] = useState('Marketing Professionals');
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const professions = [
    'Marketing Professionals',
    'Data Analysts',
    'Customer Support Specialists',
    'Sales Representatives',
    'HR Managers',
    'Project Managers',
    'Content Creators',
    'E-commerce Managers',
  ];

  const privacyPolicy = config?.interface?.privacyPolicy;
  const termsOfService = config?.interface?.termsOfService;

  const privacyPolicyRender = privacyPolicy?.externalUrl != null && (
    <a
      className="text-text-secondary underline"
      href={privacyPolicy.externalUrl}
      target={privacyPolicy.openNewTab === true ? '_blank' : undefined}
      rel="noreferrer"
    >
      {localize('com_ui_privacy_policy')}
    </a>
  );

  const termsOfServiceRender = termsOfService?.externalUrl != null && (
    <a
      className="text-text-secondary underline"
      href={termsOfService.externalUrl}
      target={termsOfService.openNewTab === true ? '_blank' : undefined}
      rel="noreferrer"
    >
      {localize('com_ui_terms_of_service')}
    </a>
  );

  const mainContentParts = (
    typeof config?.customFooter === 'string'
      ? config.customFooter
      : '[Powered by LibreChat ' +
        Constants.VERSION +
        '](https://librechat.ai) - ' +
        localize('com_ui_latest_footer')
  ).split('|');

  const mainContentRender = mainContentParts.map((text, index) => (
    <React.Fragment key={`main-content-part-${index}`}>
      <span className="text-text-secondary">
        {text.trim().replace(/\[([^\]]+)\]\([^)]+\)/, '$1')}
      </span>
    </React.Fragment>
  ));

  const footerElements = [...mainContentRender, privacyPolicyRender, termsOfServiceRender].filter(
    Boolean,
  );

  // Handle profession selection with animation
  const handleProfessionSelect = (profession: string) => {
    if (profession !== selectedProfession) {
      setIsAnimating(true);
      setTimeout(() => {
        setSelectedProfession(profession);
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 150);
    }
    setShowProfessionDropdown(false);
  };

  // Automation configurations for each profession
  const automationsByProfession = {
    'Marketing Professionals': [
      { id: 'social-posts', name: 'Generate Social Media Posts', icon: '🔧' },
      { id: 'competitor-analysis', name: 'Analyze Competitor Strategies', icon: '📊' },
      { id: 'newsletter', name: 'Create HTML Newsletters', icon: '📧' },
      { id: 'seo-optimizer', name: 'Optimize Content for SEO', icon: '🎯' },
      { id: 'campaign-planner', name: 'Plan Marketing Campaigns', icon: '📅' },
      { id: 'brand-monitor', name: 'Monitor Brand Mentions', icon: '👁️' },
      { id: 'ad-creator', name: 'Generate Ad Copy & Visuals', icon: '🎨' },
      { id: 'influencer-finder', name: 'Find Relevant Influencers', icon: '⭐' },
    ],
    'Data Analysts': [
      { id: 'csv-cleaner', name: 'Clean & Standardize CSV Data', icon: '🧹' },
      { id: 'report-generator', name: 'Generate Data Reports', icon: '📈' },
      { id: 'database-health', name: 'Check Database Health', icon: '🔍' },
      { id: 'competitor-analysis', name: 'Analyze Competitor Data', icon: '📊' },
      { id: 'trend-analyzer', name: 'Identify Data Trends', icon: '📉' },
      { id: 'data-validator', name: 'Validate Data Accuracy', icon: '✅' },
      { id: 'forecast-model', name: 'Create Predictive Models', icon: '🔮' },
      { id: 'anomaly-detector', name: 'Detect Data Anomalies', icon: '🚨' },
    ],
    'Customer Support Specialists': [
      { id: 'ticket-prioritizer', name: 'Prioritize Support Tickets', icon: '🎫' },
      { id: 'faq-generator', name: 'Generate FAQ Responses', icon: '❓' },
      { id: 'sentiment-analysis', name: 'Analyze Customer Sentiment', icon: '😊' },
      { id: 'response-templates', name: 'Create Response Templates', icon: '💬' },
      { id: 'escalation-router', name: 'Route Complex Issues', icon: '🔄' },
      { id: 'satisfaction-tracker', name: 'Track Customer Satisfaction', icon: '📊' },
      { id: 'knowledge-base', name: 'Build Knowledge Articles', icon: '📚' },
      { id: 'chat-summarizer', name: 'Summarize Long Conversations', icon: '📝' },
    ],
    'Sales Representatives': [
      { id: 'lead-scorer', name: 'Score & Rank Leads', icon: '⭐' },
      { id: 'proposal-generator', name: 'Generate Sales Proposals', icon: '📋' },
      { id: 'competitor-analysis', name: 'Analyze Competitor Pricing', icon: '📊' },
      { id: 'follow-up-scheduler', name: 'Schedule Follow-up Activities', icon: '⏰' },
      { id: 'email-sequences', name: 'Create Email Sequences', icon: '📧' },
      { id: 'objection-handler', name: 'Handle Sales Objections', icon: '🛡️' },
      { id: 'deal-tracker', name: 'Track Deal Progress', icon: '💰' },
      { id: 'territory-planner', name: 'Optimize Sales Territory', icon: '��️' },
    ],
    'HR Managers': [
      { id: 'resume-screener', name: 'Screen & Rank Resumes', icon: '📄' },
      { id: 'interview-scheduler', name: 'Schedule Interviews', icon: '📅' },
      { id: 'onboarding-planner', name: 'Plan Employee Onboarding', icon: '🎯' },
      { id: 'performance-tracker', name: 'Track Employee Performance', icon: '📈' },
      { id: 'policy-generator', name: 'Generate HR Policies', icon: '📋' },
      { id: 'benefits-optimizer', name: 'Optimize Benefits Packages', icon: '💼' },
      { id: 'culture-survey', name: 'Analyze Workplace Culture', icon: '🏢' },
      { id: 'training-planner', name: 'Plan Training Programs', icon: '🎓' },
    ],
    'Project Managers': [
      { id: 'task-organizer', name: 'Organize Project Tasks', icon: '✅' },
      { id: 'timeline-generator', name: 'Create Project Timelines', icon: '📅' },
      { id: 'resource-planner', name: 'Plan Resource Allocation', icon: '👥' },
      { id: 'risk-assessor', name: 'Assess Project Risks', icon: '⚠️' },
      { id: 'budget-tracker', name: 'Track Project Budgets', icon: '💰' },
      { id: 'status-reporter', name: 'Generate Status Reports', icon: '📊' },
      { id: 'stakeholder-comm', name: 'Manage Stakeholder Comms', icon: '📢' },
      { id: 'scope-manager', name: 'Manage Project Scope', icon: '🎯' },
    ],
    'Content Creators': [
      { id: 'content-ideas', name: 'Generate Content Ideas', icon: '💡' },
      { id: 'social-posts', name: 'Create Social Media Posts', icon: '🔧' },
      { id: 'seo-optimizer', name: 'Optimize Content for SEO', icon: '🎯' },
      { id: 'content-calendar', name: 'Plan Content Calendar', icon: '📅' },
      { id: 'hashtag-generator', name: 'Generate Relevant Hashtags', icon: '#️⃣' },
      { id: 'video-scripts', name: 'Write Video Scripts', icon: '🎬' },
      { id: 'blog-writer', name: 'Write Blog Articles', icon: '✍️' },
      { id: 'image-optimizer', name: 'Optimize Images for Platforms', icon: '🖼️' },
    ],
    'E-commerce Managers': [
      { id: 'product-optimizer', name: 'Optimize Product Listings', icon: '🛍️' },
      { id: 'inventory-tracker', name: 'Track Inventory Levels', icon: '📦' },
      { id: 'competitor-analysis', name: 'Analyze Competitor Products', icon: '📊' },
      { id: 'review-analyzer', name: 'Analyze Customer Reviews', icon: '⭐' },
      { id: 'price-optimizer', name: 'Optimize Pricing Strategy', icon: '💲' },
      { id: 'ad-campaign', name: 'Manage Ad Campaigns', icon: '📱' },
      { id: 'conversion-tracker', name: 'Track Conversion Rates', icon: '📈' },
      { id: 'supplier-manager', name: 'Manage Supplier Relations', icon: '🤝' },
    ],
  };

  const currentAutomations =
    automationsByProfession[selectedProfession as keyof typeof automationsByProfession] || [];

  // Handle automation pill click
  const handleAutomationClick = (automation: { id: string; name: string; icon: string }) => {
    // Create a structured workflow execution message with integration credentials
    const workflowMessage = `Execute automation: ${automation.id}
Profession: ${selectedProfession}
Task: ${automation.name}
Required Integrations: ${getRequiredIntegrations(automation.id)}
Parameters: {}`;

    console.log('Workflow execution request:', {
      type: 'workflow_execution',
      profession: selectedProfession,
      automation: automation.id,
      name: automation.name,
      requiredIntegrations: getRequiredIntegrations(automation.id),
      message: workflowMessage,
    });

    // In a real implementation, this would:
    // 1. Check if required integrations are connected
    // 2. Send this message to the chat interface with user credentials
    // 3. The MCP server would receive and parse it
    // 4. Pass integration credentials to n8n workflow
    // 5. Route to the appropriate n8n workflow based on automation.id
    // 6. Return streaming responses showing progress

    // For demo purposes, show what the workflow execution would look like
    const requiredIntegrations = getRequiredIntegrations(automation.id);
    const integrationsList = requiredIntegrations.join(', ');

    alert(`🚀 Workflow Execution Request:

Automation: ${automation.name}
ID: ${automation.id}
Profession: ${selectedProfession}
Required Integrations: ${integrationsList}

This would:
1. Check if you have ${integrationsList} connected in Integrations panel
2. Send your encrypted credentials to n8n workflow
3. Execute the automation with your authenticated services
4. Return real-time progress updates

n8n MCP Server: ${window.location.origin}/mcp/n8n-automation
Workflow Endpoint: ${getWorkflowEndpoint(automation.id)}`);
  };

  // Helper function to determine required integrations for each automation
  const getRequiredIntegrations = (automationId: string): string[] => {
    const integrationMap: Record<string, string[]> = {
      'social-posts': ['google', 'linkedin', 'twitter'],
      'competitor-analysis': ['google', 'airtable'],
      newsletter: ['gmail', 'mailchimp'],
      'seo-optimizer': ['google'],
      'csv-cleaner': ['google', 'dropbox'],
      'report-generator': ['google', 'slack'],
      'database-health': ['aws', 'slack'],
      'ticket-prioritizer': ['zendesk', 'slack'],
      'faq-generator': ['notion', 'zendesk'],
      'sentiment-analysis': ['google', 'slack'],
      'lead-scorer': ['salesforce', 'hubspot'],
      'proposal-generator': ['google', 'salesforce'],
      'resume-screener': ['google', 'linkedin'],
      'interview-scheduler': ['calendar', 'zoom'],
      'task-organizer': ['asana', 'trello'],
      'timeline-generator': ['monday', 'google'],
      'content-ideas': ['google', 'notion'],
      'content-calendar': ['google', 'trello'],
      'product-optimizer': ['shopify', 'google'],
      'inventory-tracker': ['shopify', 'google'],
    };

    return integrationMap[automationId] || ['google'];
  };

  // Helper function to get n8n workflow webhook endpoint
  const getWorkflowEndpoint = (automationId: string): string => {
    return `http://localhost:5678/webhook/${automationId}`;
  };

  // Close dropdown on click away
  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfessionDropdown(false);
      }
    };

    if (showProfessionDropdown) {
      document.addEventListener('mousedown', handleClickAway);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, [showProfessionDropdown]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* Demo Mode Banner */}
      <div className="flex-shrink-0 border-b bg-yellow-100 p-2 text-center font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        🥝 Agent Kiwi Demo - Explore AI-powered workflow automations
      </div>

      {/* Chat Header */}
      <div className="sticky top-0 z-10 flex h-14 w-full flex-shrink-0 items-center justify-between overflow-hidden bg-white p-2 font-semibold text-text-primary dark:bg-gray-800">
        <div className="flex w-full min-w-0 items-center justify-between gap-1">
          <div className="flex min-w-0 flex-shrink items-center gap-1">
            <div className="flex items-center gap-1">
              {/* Open Sidebar Button */}
              <TooltipAnchor
                description={localize('com_nav_open_sidebar')}
                render={
                  <Button
                    size="icon"
                    variant="outline"
                    disabled
                    aria-label={localize('com_nav_open_sidebar')}
                    className="flex-shrink-0 cursor-not-allowed rounded-xl border border-border-light bg-surface-secondary p-2 opacity-50 hover:bg-surface-hover max-md:hidden"
                  >
                    <Sidebar />
                  </Button>
                }
              />

              {/* New Chat Button */}
              <TooltipAnchor
                description={localize('com_ui_new_chat')}
                render={
                  <Button
                    size="icon"
                    variant="outline"
                    disabled
                    aria-label={localize('com_ui_new_chat')}
                    className="flex-shrink-0 cursor-not-allowed rounded-xl border border-border-light bg-surface-secondary p-2 opacity-50 hover:bg-surface-hover max-md:hidden"
                  >
                    <NewChatIcon />
                  </Button>
                }
              />
            </div>

            {/* Model Selector */}
            <button
              disabled
              className="my-1 flex h-10 min-w-0 max-w-[200px] flex-shrink cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-border-light bg-surface-secondary px-3 py-2 text-sm text-text-primary opacity-50 hover:bg-surface-tertiary"
              aria-label="Agent Kiwi Demo"
            >
              <div className="flex flex-shrink-0 items-center justify-center overflow-hidden">
                <div className="rounded-full">🥝</div>
              </div>
              <span className="min-w-0 truncate text-left">Kiwi Agent</span>
            </button>

            {/* Action Buttons - Hidden on small screens */}
            <div className="hidden items-center gap-1 lg:flex">
              {/* Presets Button */}
              <TooltipAnchor
                description={localize('com_endpoint_examples')}
                render={
                  <button
                    disabled
                    aria-label={localize('com_endpoint_examples')}
                    className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50"
                  >
                    <BookCopy size={16} aria-label="Preset Icon" />
                  </button>
                }
              />

              {/* Add Multi-Conversation Button */}
              <TooltipAnchor
                description={localize('com_ui_add_multi_conversation')}
                render={
                  <button
                    disabled
                    aria-label={localize('com_ui_add_multi_conversation')}
                    className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50"
                  >
                    <PlusCircle size={16} aria-label="Plus Icon" />
                  </button>
                }
              />

              {/* Temporary Chat Button */}
              <TooltipAnchor
                description={localize('com_ui_temporary')}
                render={
                  <button
                    disabled
                    aria-label={localize('com_ui_temporary')}
                    className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50"
                  >
                    <MessageCircleDashed size={16} />
                  </button>
                }
              />
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex flex-shrink-0 items-center gap-1">
            {/* Settings/Export Button */}
            <TooltipAnchor
              description="Export & Share"
              render={
                <button
                  disabled
                  className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50"
                >
                  <Settings2 size={16} />
                </button>
              }
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Welcome Section */}
        <div className="flex justify-center">
          <div className="max-w-2xl text-center">
            <div className="rounded-lg bg-surface-secondary p-6">
              <h2 className="mb-4 text-2xl font-semibold text-text-primary">
                Welcome to the Agent Kiwi Demo
              </h2>

              {/* Profession Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 text-lg">
                  <span className="text-text-secondary">Explore automations for</span>
                  <div className="relative inline-block" ref={dropdownRef}>
                    <button
                      onClick={() => setShowProfessionDropdown(!showProfessionDropdown)}
                      className="inline-flex items-center gap-1 border-b border-text-primary bg-transparent px-1 py-0.5 font-medium text-text-primary transition-all duration-200 hover:border-text-secondary hover:text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                      <span
                        className={`transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                      >
                        {selectedProfession}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${showProfessionDropdown ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfessionDropdown && (
                      <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border border-border-light bg-white shadow-lg dark:bg-gray-800">
                        <div className="py-2">
                          {professions.map((profession) => (
                            <button
                              key={profession}
                              onClick={() => handleProfessionSelect(profession)}
                              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-surface-hover ${
                                selectedProfession === profession
                                  ? 'bg-surface-hover font-medium text-text-primary'
                                  : 'text-text-primary'
                              }`}
                            >
                              {profession}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Pills Cluster */}
        <div className="flex justify-center">
          <div className="max-w-5xl">
            <div
              className={`transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}
            >
              <div className="flex flex-wrap items-center justify-center gap-3 p-6">
                {currentAutomations.map((automation, index) => (
                  <button
                    key={`${selectedProfession}-${automation.id}`}
                    className="group relative flex items-center gap-2 rounded-full border border-border-light bg-white px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:border-border-medium hover:shadow-md dark:bg-gray-800 dark:hover:border-border-medium"
                    style={{
                      animationDelay: `${index * 80}ms`,
                      animation: isAnimating ? 'none' : 'fadeInUp 0.4s ease-out forwards',
                    }}
                    onClick={() => handleAutomationClick(automation)}
                  >
                    <span className="text-lg">{automation.icon}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium text-text-primary group-hover:text-text-primary">
                        {automation.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add some spacing at bottom */}
        <div className="h-8"></div>
      </div>

      {/* Chat Input Area */}
      <div className="mx-auto flex w-full max-w-none flex-shrink-0 flex-row gap-3 px-2 transition-[max-width] duration-300 sm:mb-10 sm:max-w-3xl xl:max-w-4xl">
        <div className="relative flex h-full min-w-0 flex-1 items-stretch md:flex-col">
          <div className="flex w-full min-w-0 items-center">
            <div className="relative flex w-full min-w-0 flex-grow flex-col overflow-hidden rounded-t-3xl border border-border-light bg-surface-chat pb-4 text-text-primary shadow-md transition-all duration-200 sm:rounded-3xl sm:pb-0">
              {/* Text Input */}
              <div className="flex min-w-0">
                <TextareaAutosize
                  disabled
                  placeholder="Type a message... (disabled in demo mode)"
                  rows={1}
                  maxRows={8}
                  className="m-0 w-full min-w-0 resize-none bg-transparent px-5 py-[13px] placeholder-black/50 transition-[max-height] duration-200 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder-white/50 md:py-3.5"
                />
              </div>

              {/* Buttons Row */}
              <div className="items-between flex min-w-0 gap-2 pb-2">
                <div className="ml-2 flex-shrink-0">
                  {/* Attach Files Button */}
                  <TooltipAnchor
                    description={localize('com_sidepanel_attach_files')}
                    render={
                      <button
                        type="button"
                        disabled
                        aria-label={localize('com_sidepanel_attach_files')}
                        className="flex size-9 flex-shrink-0 items-center justify-center rounded-full p-1 text-text-primary transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                      >
                        <div className="flex w-full items-center justify-center gap-2">
                          <AttachmentIcon />
                        </div>
                      </button>
                    }
                  />
                </div>

                {/* Badge Pills */}
                <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                  {/* Search Badge */}
                  <button
                    type="button"
                    disabled
                    aria-label={localize('com_ui_search')}
                    className="group relative inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full border border-border-medium bg-transparent p-2 text-sm font-medium text-text-primary shadow-sm transition-all hover:bg-surface-hover hover:shadow-md active:shadow-inner disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                  >
                    <Globe className="icon-md" />
                    <span className="hidden truncate lg:block">Search</span>
                  </button>

                  {/* MCP Server Badge */}
                  <button
                    type="button"
                    disabled
                    aria-label={localize('com_ui_mcp_servers')}
                    className="group relative inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full border border-border-medium bg-transparent p-2 text-sm font-medium text-text-primary shadow-sm transition-all hover:bg-surface-hover hover:shadow-md active:shadow-inner disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                  >
                    <MCPIcon className="icon-md" />
                    <span className="hidden truncate lg:block">MCP</span>
                  </button>
                </div>

                <div className="mx-auto flex flex-1" />

                {/* Microphone Button */}
                <TooltipAnchor
                  description={localize('com_ui_use_micrphone')}
                  render={
                    <button
                      type="button"
                      disabled
                      aria-label={localize('com_ui_use_micrphone')}
                      className="flex size-9 flex-shrink-0 items-center justify-center rounded-full p-1 text-text-primary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                      title={localize('com_ui_use_micrphone')}
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  }
                />

                <div className="mr-2 flex-shrink-0">
                  {/* Send Button */}
                  <TooltipAnchor
                    description={localize('com_nav_send_message')}
                    render={
                      <button
                        disabled
                        aria-label={localize('com_nav_send_message')}
                        className="flex-shrink-0 rounded-full bg-text-primary p-1.5 text-white outline-offset-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-10 dark:bg-white dark:text-gray-900"
                        data-testid="send-button"
                        type="submit"
                      >
                        <span className="" data-state="closed">
                          <SendIcon size={24} />
                        </span>
                      </button>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative w-full">
        <div
          className="absolute bottom-0 left-0 right-0 hidden items-center justify-center gap-2 px-2 py-2 text-center text-xs text-text-primary sm:flex md:px-[60px]"
          role="contentinfo"
        >
          {footerElements.map((contentRender, index) => {
            const isLastElement = index === footerElements.length - 1;
            return (
              <React.Fragment key={`footer-element-${index}`}>
                {contentRender}
                {!isLastElement && (
                  <div
                    key={`separator-${index}`}
                    className="h-2 border-r-[1px] border-border-medium"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
