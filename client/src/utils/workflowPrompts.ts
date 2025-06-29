// Workflow prompt templates for conversation-driven automation

export const WORKFLOW_PROMPTS: Record<string, string | ((context?: any) => string)> = {
  // Initial category selection
  'categories.initial': `<think>
User wants to see workflow automation categories. I should present them with clear options for different types of business automations they can execute.
</think>

# 🚀 Workflow Automation

Welcome! I can help you automate various business processes. Choose a category to get started:

**🎯 Lead Generation**
- Find LinkedIn prospects
- Competitor analysis  
- Event attendee research
- Lead scoring & qualification

**📧 Email Marketing**
- Campaign creation
- Sequence automation
- A/B testing
- Analytics & reporting

**📊 Data Analysis**
- CSV/Excel processing
- Report generation
- Data visualization
- Trend analysis

**💼 Client Management**
- Onboarding automation
- Follow-up sequences
- Document generation
- CRM integration

**🔍 Research**
- Market research
- Competitor monitoring
- Content research
- Industry insights

**⚙️ Process Automation**
- Document processing
- Approval workflows
- Data synchronization
- System integrations

Which category interests you?`,

  // Lead Generation workflows
  'categories.lead-generation': `<think>
User selected lead generation. I should show them specific lead generation workflows available and ask what type of leads they're looking for.
</think>

# 🎯 Lead Generation Automation

Great choice! I can help you with various lead generation tasks:

**Available Lead Generation Workflows:**

**🔍 LinkedIn Prospect Search**
- Find prospects by industry, role, company size
- Extract contact information
- Qualify leads based on criteria
- Export to CRM or CSV

**📈 Competitor Analysis**
- Analyze competitor followers
- Identify decision makers
- Find similar companies
- Build prospect lists from competitor data

**🎪 Event Attendee Research**
- Scrape event attendee lists
- Research attendee companies
- Find contact information
- Create targeted outreach lists

**📊 Lead Scoring & Qualification**
- Score existing leads
- Enrich lead data
- Prioritize outreach
- Update CRM records

What type of leads are you looking to find?`,

  // Email Marketing workflows  
  'categories.email-marketing': `<think>
User selected email marketing. I should show them email automation workflows and ask about their specific email marketing needs.
</think>

# 📧 Email Marketing Automation

Perfect! I can help you create and manage email campaigns:

**Available Email Marketing Workflows:**

**📝 Campaign Creation**
- Generate email templates
- Create subject line variations
- Design responsive layouts
- Set up tracking pixels

**🔄 Sequence Automation**
- Build drip campaigns
- Set up autoresponders
- Create nurture sequences
- Schedule follow-ups

**🧪 A/B Testing**
- Test subject lines
- Compare email designs
- Analyze open rates
- Optimize send times

**📈 Analytics & Reporting**
- Track campaign performance
- Generate engagement reports
- Monitor deliverability
- ROI analysis

What email marketing task can I help you with?`,

  // Data Analysis workflows
  'categories.data-analysis': `<think>
User selected data analysis. I should show them data processing and analysis workflows available.
</think>

# 📊 Data Analysis Automation

Excellent! I can help you process and analyze data:

**Available Data Analysis Workflows:**

**📋 CSV/Excel Processing**
- Clean and format data
- Merge multiple files
- Remove duplicates
- Standardize formats

**📈 Report Generation**
- Create automated reports
- Generate charts and graphs
- Schedule regular reports
- Export to various formats

**📊 Data Visualization**
- Create interactive dashboards
- Generate chart collections
- Build comparison views
- Export visualizations

**📉 Trend Analysis**
- Identify patterns in data
- Forecast trends
- Compare time periods
- Generate insights

What type of data would you like to analyze?`,

  // Client Management workflows
  'categories.client-management': `<think>
User selected client management. I should show them client-related automation workflows.
</think>

# 💼 Client Management Automation

Great! I can help streamline your client management processes:

**Available Client Management Workflows:**

**🚀 Onboarding Automation**
- Welcome email sequences
- Document collection
- Account setup processes
- Training material delivery

**📞 Follow-up Sequences**
- Check-in reminders
- Satisfaction surveys
- Renewal notifications
- Upsell opportunities

**📄 Document Generation**
- Contract creation
- Proposal generation
- Invoice automation
- Report templates

**🔗 CRM Integration**
- Data synchronization
- Contact updates
- Activity logging
- Pipeline management

What client management task can I help you with?`,

  // Research workflows
  'categories.research': `<think>
User selected research. I should show them research automation workflows available.
</think>

# 🔍 Research Automation

Perfect! I can help you automate various research tasks:

**Available Research Workflows:**

**🏢 Market Research**
- Industry analysis
- Market sizing
- Trend identification
- Competitive landscape

**👀 Competitor Monitoring**
- Track competitor updates
- Monitor pricing changes
- Analyze marketing campaigns
- Social media monitoring

**📝 Content Research**
- Topic research
- Source gathering
- Fact checking
- Reference compilation

**💡 Industry Insights**
- News aggregation
- Trend analysis
- Expert opinions
- Market predictions

What type of research can I help you with?`,

  // Process Automation workflows
  'categories.process-automation': `<think>
User selected process automation. I should show them general business process automation workflows.
</think>

# ⚙️ Process Automation

Excellent! I can help you automate various business processes:

**Available Process Automation Workflows:**

**📄 Document Processing**
- PDF text extraction
- Form data processing
- Document classification
- Content organization

**✅ Approval Workflows**
- Route approvals
- Send notifications
- Track status
- Manage escalations

**🔄 Data Synchronization**
- Connect systems
- Sync databases
- Update records
- Maintain consistency

**🔗 System Integrations**
- API connections
- Webhook automation
- Data transfers
- Workflow triggers

What process would you like to automate?`,

  // Specific workflow prompts
  'linkedin-prospects': (context: any = {}) => `<think>
User wants to find LinkedIn prospects. I need to:
1. Understand their target criteria (industry, company size, location, role level)
2. Execute LinkedIn prospect search workflow
3. Format and present results
4. Suggest follow-up actions (email campaign, CRM export, similar search)

I should ask for their specific criteria if not provided in context.
</think>

# 🔍 LinkedIn Prospect Search

I'll help you find qualified LinkedIn prospects! To get the best results, I need to understand your target criteria:

**Please specify:**
- **Industry/Sector** (e.g., SaaS, Healthcare, Manufacturing)
- **Company Size** (e.g., 50-200 employees, Enterprise 1000+)
- **Location** (e.g., United States, California, Global)
- **Role Level** (e.g., C-Level, VP/Director, Manager, All levels)
- **Specific Titles** (optional - e.g., "Chief Marketing Officer")

You can either tell me your criteria, or I can start with some common defaults. What's your target prospect profile?`,

  'email-campaign': (context: any = {}) => `<think>
User wants to create an email campaign. If they have prospects from a previous workflow, I should reference that context. I need to:
1. Understand their campaign goals
2. Determine target audience (from context or ask)
3. Create email templates
4. Set up campaign parameters
5. Suggest next steps for execution
</think>

# 📧 Email Campaign Creation

I'll help you create a targeted email campaign! ${context.prospectCount ? `I see you have ${context.prospectCount} prospects from your recent search - perfect for a campaign.` : ''}

**Let me know:**
- **Campaign Goal** (e.g., Lead nurturing, Product demo, Event invitation)
- **Email Type** (e.g., Cold outreach, Follow-up sequence, Newsletter)
- **Tone/Style** (e.g., Professional, Casual, Urgent)
- **Key Message** (e.g., "Introduce our new automation platform")

${context.prospectData ? 'I\'ll customize the campaign based on your prospect data (industry, company size, roles).' : 'Do you have a target audience in mind, or should we define one?'}

What's the main goal of this email campaign?`,
};

export default WORKFLOW_PROMPTS;