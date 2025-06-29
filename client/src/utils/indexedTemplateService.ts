// Indexed Template Service - Uses templates from our template-sync service
import type { Template, BusinessCategory } from '~/data-provider/Templates/types';

// Template sync service configuration
const TEMPLATE_SYNC_URL = process.env.REACT_APP_TEMPLATE_SYNC_URL || 'http://localhost:3001';

class IndexedTemplateService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  /**
   * Get business-friendly categories with counts
   */
  async getBusinessCategories(): Promise<BusinessCategory[]> {
    const cacheKey = 'business_categories';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${TEMPLATE_SYNC_URL}/templates/stats`);
      const stats = await response.json();
      
      const businessCategories: BusinessCategory[] = [
        { id: 'ai-automation', name: 'AI & Automation', icon: '🤖', count: 0 },
        { id: 'marketing-growth', name: 'Marketing & Growth', icon: '📈', count: 0 },
        { id: 'sales-crm', name: 'Sales & CRM', icon: '💼', count: 0 },
        { id: 'support-service', name: 'Support & Service', icon: '🎧', count: 0 },
        { id: 'finance-accounting', name: 'Finance & Accounting', icon: '💰', count: 0 },
        { id: 'hr-operations', name: 'HR & Operations', icon: '👥', count: 0 },
        { id: 'it-devops', name: 'IT & DevOps', icon: '⚙️', count: 0 },
        { id: 'product-design', name: 'Product & Design', icon: '🎨', count: 0 },
        { id: 'utilities-tools', name: 'Utilities & Tools', icon: '🔧', count: 0 }
      ];

      // Distribute total count across categories (basic implementation)
      const totalTemplates = stats.total_templates || 0;
      const avgPerCategory = Math.floor(totalTemplates / businessCategories.length);
      businessCategories.forEach((cat, index) => {
        cat.count = index === 0 ? totalTemplates - (avgPerCategory * (businessCategories.length - 1)) : avgPerCategory;
      });

      this.setCache(cacheKey, businessCategories);
      return businessCategories;
    } catch (error) {
      console.error('Failed to fetch business categories:', error);
      return [];
    }
  }

  /**
   * Get templates by business category
   */
  async getTemplatesByBusinessCategory(businessCategory: string): Promise<Template[]> {
    const cacheKey = `templates_${businessCategory}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        category: businessCategory,
        limit: '100'  // Get more templates per category
      });

      const response = await fetch(`${TEMPLATE_SYNC_URL}/templates/search?${params}`);
      const data = await response.json();
      
      const templates = data.templates || [];
      this.setCache(cacheKey, templates);
      return templates;
    } catch (error) {
      console.error(`Failed to fetch templates for category ${businessCategory}:`, error);
      return [];
    }
  }

  /**
   * Get all templates (no category filter)
   */
  async getAllTemplates(limit: number = 1000): Promise<Template[]> {
    const cacheKey = `all_templates_${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });

      const response = await fetch(`${TEMPLATE_SYNC_URL}/templates/search?${params}`);
      const data = await response.json();
      
      const templates = data.templates || [];
      this.setCache(cacheKey, templates);
      return templates;
    } catch (error) {
      console.error('Failed to fetch all templates:', error);
      return [];
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(searchTerm: string, limit: number = 20): Promise<Template[]> {
    try {
      const params = new URLSearchParams({
        query: searchTerm,
        limit: limit.toString()
      });

      const response = await fetch(`${TEMPLATE_SYNC_URL}/templates/search?${params}`);
      const data = await response.json();
      
      return data.templates || [];
    } catch (error) {
      console.error('Failed to search templates:', error);
      return [];
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: number): Promise<Template | null> {
    const cacheKey = `template_${id}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${TEMPLATE_SYNC_URL}/templates/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }

      const template = await response.json();
      this.setCache(cacheKey, template);
      return template;
    } catch (error) {
      console.error(`Failed to fetch template ${id}:`, error);
      return null;
    }
  }

  /**
   * Generate workflow prompt based on template
   */
  generateTemplatePrompt(template: Template): string {
    return `<think>
User wants to use the "${template.name}" workflow template from n8n.

Template Details:
- ID: ${template.n8n_id}
- Description: ${template.description}
- Node Count: ${template.node_count}
- Categories: ${template.categories.map(c => c.name).join(', ')}
- Business Category: ${template.our_metadata.business_category}
- Difficulty: ${template.our_metadata.difficulty}

I need to:
1. Explain what this workflow does
2. Ask for any required parameters/connections
3. Guide them through setup
4. Execute the workflow when ready
</think>

# 🚀 ${template.name}

I'll help you set up this automation workflow! Here's what it does:

**${template.description}**

This workflow has ${template.node_count} nodes and covers: ${template.categories.map(c => c.name).join(', ')}.

**Difficulty Level:** ${template.our_metadata.difficulty}

To get started, I'll need to understand:
- What specific data or services you want to connect
- Any API keys or credentials required
- Your desired output format or destination

What would you like to configure first?`;
  }

  /**
   * Trigger template sync
   */
  async triggerSync(): Promise<{ message: string; status: string }> {
    try {
      const response = await fetch(`${TEMPLATE_SYNC_URL}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<any> {
    try {
      const response = await fetch(`${TEMPLATE_SYNC_URL}/sync/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get sync status:', error);
      throw error;
    }
  }

  /**
   * Clear all cached data - use after sync completion
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Template cache cleared');
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
}

// Export singleton instance
export const indexedTemplateService = new IndexedTemplateService();
export default indexedTemplateService;