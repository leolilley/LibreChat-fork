// n8n Template Service - Now uses indexed templates from template-sync service
import { templateApi, useTemplateCategories, useTemplateSearch } from '~/data-provider/Templates';
import type { Template, BusinessCategory } from '~/data-provider/Templates/types';

// Legacy interfaces for backward compatibility
interface N8nCategory {
  id: number;
  name: string;
  icon?: string;
}

interface N8nTemplate {
  id: number;
  name: string;
  description: string;
  categories: N8nCategory[];
  workflowInfo: {
    nodeCount: number;
    triggerCount: number;
  };
  workflow: any;
  image?: string;
  user?: {
    username: string;
  };
}

interface TemplateSearchResponse {
  workflows: N8nTemplate[];
  totalWorkflows: number;
}

interface CategoryMapping {
  [key: string]: {
    name: string;
    icon: string;
    description: string;
    searchTerms: string[];
  };
}

// Map n8n categories to our business-friendly categories
const CATEGORY_MAPPINGS: CategoryMapping = {
  'AI': {
    name: 'AI & Automation',
    icon: '🤖',
    description: 'AI-powered workflows and intelligent automation',
    searchTerms: ['ai', 'artificial intelligence', 'machine learning', 'chatbot', 'openai']
  },
  'Marketing': {
    name: 'Marketing & Growth',
    icon: '📈',
    description: 'Marketing automation, lead generation, and growth hacking',
    searchTerms: ['marketing', 'lead generation', 'email campaign', 'social media', 'seo']
  },
  'Sales': {
    name: 'Sales & CRM',
    icon: '💼',
    description: 'Sales automation, CRM integration, and lead management',
    searchTerms: ['sales', 'crm', 'lead', 'prospect', 'deal', 'pipeline']
  },
  'Support': {
    name: 'Support & Service',
    icon: '🎧',
    description: 'Customer support automation and service workflows',
    searchTerms: ['support', 'customer service', 'helpdesk', 'ticket', 'chat']
  },
  'Finance': {
    name: 'Finance & Accounting',
    icon: '💰',
    description: 'Financial automation, reporting, and accounting workflows',
    searchTerms: ['finance', 'accounting', 'invoice', 'payment', 'expense', 'budget']
  },
  'HR': {
    name: 'HR & Operations',
    icon: '👥',
    description: 'Human resources, recruitment, and operational workflows',
    searchTerms: ['hr', 'human resources', 'recruitment', 'onboarding', 'employee']
  },
  'IT Ops': {
    name: 'IT & DevOps',
    icon: '⚙️',
    description: 'IT operations, DevOps, and system administration',
    searchTerms: ['devops', 'it operations', 'monitoring', 'deployment', 'infrastructure']
  },
  'Product': {
    name: 'Product & Design',
    icon: '🎨',
    description: 'Product development, design workflows, and user research',
    searchTerms: ['product', 'design', 'user research', 'feedback', 'analytics']
  },
  'Building Blocks': {
    name: 'Utilities & Tools',
    icon: '🔧',
    description: 'General purpose utilities and workflow building blocks',
    searchTerms: ['utility', 'tool', 'helper', 'integration', 'connector']
  }
};

class N8nTemplateService {
  private baseUrl = 'https://api.n8n.io';
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  /**
   * Get all available categories from n8n
   */
  async getCategories(): Promise<N8nCategory[]> {
    const cacheKey = 'categories';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/templates/categories`);
      const categories = await response.json();
      
      this.setCache(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('Failed to fetch n8n categories:', error);
      return [];
    }
  }

  /**
   * Search templates with filters
   */
  async searchTemplates(params: {
    search?: string;
    categories?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<TemplateSearchResponse> {
    const { search, categories, limit = 20, offset = 0 } = params;
    
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    if (search) {
      queryParams.append('search', search);
    }
    
    if (categories && categories.length > 0) {
      categories.forEach(cat => queryParams.append('categories', cat));
    }

    const cacheKey = `search_${queryParams.toString()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/templates/search?${queryParams}`);
      const data = await response.json();
      
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to search templates:', error);
      return { workflows: [], totalWorkflows: 0 };
    }
  }

  /**
   * Get templates by category with business-friendly grouping
   */
  async getTemplatesByBusinessCategory(businessCategory: string): Promise<N8nTemplate[]> {
    const mapping = CATEGORY_MAPPINGS[businessCategory];
    if (!mapping) return [];

    // Search using multiple terms for better coverage
    const searchPromises = mapping.searchTerms.map(term => 
      this.searchTemplates({ search: term, limit: 10 })
    );

    try {
      const results = await Promise.all(searchPromises);
      
      // Combine and deduplicate results
      const allTemplates = results.flatMap(result => result.workflows);
      const uniqueTemplates = this.deduplicateTemplates(allTemplates);
      
      // Sort by relevance (node count, description match)
      return this.sortTemplatesByRelevance(uniqueTemplates, mapping.searchTerms);
    } catch (error) {
      console.error(`Failed to fetch templates for category ${businessCategory}:`, error);
      return [];
    }
  }

  /**
   * Get popular/trending templates
   */
  async getPopularTemplates(limit: number = 12): Promise<N8nTemplate[]> {
    const cacheKey = `popular_${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Get general popular templates
      const response = await this.searchTemplates({ limit });
      const templates = response.workflows;
      
      this.setCache(cacheKey, templates);
      return templates;
    } catch (error) {
      console.error('Failed to fetch popular templates:', error);
      return [];
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: number): Promise<N8nTemplate | null> {
    const cacheKey = `template_${id}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/templates/${id}`);
      const template = await response.json();
      
      this.setCache(cacheKey, template);
      return template;
    } catch (error) {
      console.error(`Failed to fetch template ${id}:`, error);
      return null;
    }
  }

  /**
   * Get business-friendly categories for UI
   */
  getBusinessCategories() {
    return Object.entries(CATEGORY_MAPPINGS).map(([key, mapping]) => ({
      id: key,
      name: mapping.name,
      icon: mapping.icon,
      description: mapping.description
    }));
  }

  /**
   * Generate workflow prompt based on template
   */
  generateTemplatePrompt(template: N8nTemplate): string {
    return `<think>
User wants to use the "${template.name}" workflow template from n8n.

Template Details:
- ID: ${template.id}
- Description: ${template.description}
- Node Count: ${template.workflowInfo.nodeCount}
- Categories: ${template.categories.map(c => c.name).join(', ')}

I need to:
1. Explain what this workflow does
2. Ask for any required parameters/connections
3. Guide them through setup
4. Execute the workflow when ready
</think>

# 🚀 ${template.name}

I'll help you set up this automation workflow! Here's what it does:

**${template.description}**

This workflow has ${template.workflowInfo.nodeCount} nodes and covers: ${template.categories.map(c => c.name).join(', ')}.

To get started, I'll need to understand:
- What specific data or services you want to connect
- Any API keys or credentials required
- Your desired output format or destination

What would you like to configure first?`;
  }

  // Private helper methods
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const { data, timestamp } = cached;
    if (Date.now() - timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }

    return data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private deduplicateTemplates(templates: N8nTemplate[]): N8nTemplate[] {
    const seen = new Set();
    return templates.filter(template => {
      if (seen.has(template.id)) {
        return false;
      }
      seen.add(template.id);
      return true;
    });
  }

  private sortTemplatesByRelevance(templates: N8nTemplate[], searchTerms: string[]): N8nTemplate[] {
    return templates.sort((a, b) => {
      // Calculate relevance score
      const scoreA = this.calculateRelevanceScore(a, searchTerms);
      const scoreB = this.calculateRelevanceScore(b, searchTerms);
      
      return scoreB - scoreA; // Higher score first
    });
  }

  private calculateRelevanceScore(template: N8nTemplate, searchTerms: string[]): number {
    let score = 0;
    const text = `${template.name} ${template.description}`.toLowerCase();
    
    // Points for search term matches
    searchTerms.forEach(term => {
      if (text.includes(term.toLowerCase())) {
        score += 10;
      }
    });
    
    // Points for node count (more complex = potentially more useful)
    score += Math.min(template.workflowInfo.nodeCount, 20);
    
    // Points for having a description
    if (template.description && template.description.length > 50) {
      score += 5;
    }
    
    return score;
  }
}

// Export types
export type { N8nTemplate, N8nCategory, TemplateSearchResponse };

// Export singleton instance
export const n8nTemplateService = new N8nTemplateService();
export default n8nTemplateService;