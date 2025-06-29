import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import type { 
  Template, 
  TemplateSearchParams, 
  TemplateSearchResponse, 
  TemplateStats,
  CategoriesResponse,
  SyncStatus 
} from './types';

// Template sync service configuration
const TEMPLATE_SYNC_URL = process.env.REACT_APP_TEMPLATE_SYNC_URL || 'http://localhost:3001';

// API functions
const templateApi = {
  search: async (params: TemplateSearchParams = {}): Promise<TemplateSearchResponse> => {
    const { search, category, limit = 20, offset = 0 } = params;
    
    const searchParams = new URLSearchParams();
    if (search) searchParams.append('query', search);
    if (category) searchParams.append('category', category);
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', offset.toString());

    const response = await fetch(`${TEMPLATE_SYNC_URL}/templates/search?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search templates: ${response.status}`);
    }

    return response.json();
  },

  getById: async (id: number): Promise<Template> => {
    const response = await fetch(`${TEMPLATE_SYNC_URL}/templates/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get template: ${response.status}`);
    }

    return response.json();
  },

  getStats: async (): Promise<TemplateStats> => {
    const response = await fetch(`${TEMPLATE_SYNC_URL}/templates/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to get template stats: ${response.status}`);
    }

    return response.json();
  },

  getCategories: async (): Promise<CategoriesResponse> => {
    // For now, we'll generate categories from stats
    // Later we can enhance template-sync service to provide business category counts
    const stats = await templateApi.getStats();
    
    const businessCategories = [
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

    return {
      categories: businessCategories,
      total_templates: totalTemplates
    };
  },

  getSyncStatus: async (): Promise<SyncStatus> => {
    const response = await fetch(`${TEMPLATE_SYNC_URL}/sync/status`);
    
    if (!response.ok) {
      throw new Error(`Failed to get sync status: ${response.status}`);
    }

    return response.json();
  },

  triggerSync: async (): Promise<{ message: string; status: string }> => {
    const response = await fetch(`${TEMPLATE_SYNC_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `Failed to trigger sync: ${response.status}`);
    }

    return response.json();
  }
};

// React Query hooks
export const useTemplateSearch = (
  params: TemplateSearchParams = {},
  options?: UseQueryOptions<TemplateSearchResponse>
) => {
  return useQuery({
    queryKey: ['templates', 'search', params],
    queryFn: () => templateApi.search(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

export const useTemplate = (
  id: number,
  options?: UseQueryOptions<Template>
) => {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templateApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
};

export const useTemplateStats = (
  options?: UseQueryOptions<TemplateStats>
) => {
  return useQuery({
    queryKey: ['templates', 'stats'],
    queryFn: templateApi.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

export const useTemplateCategories = (
  options?: UseQueryOptions<CategoriesResponse>
) => {
  return useQuery({
    queryKey: ['templates', 'categories'],
    queryFn: templateApi.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
};

export const useSyncStatus = (
  options?: UseQueryOptions<SyncStatus>
) => {
  return useQuery({
    queryKey: ['templates', 'sync', 'status'],
    queryFn: templateApi.getSyncStatus,
    refetchInterval: 5000, // Poll every 5 seconds when sync is in progress
    staleTime: 1000, // 1 second
    ...options
  });
};

// Export API functions for mutations
export { templateApi };