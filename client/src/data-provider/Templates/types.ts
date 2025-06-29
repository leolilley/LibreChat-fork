// Template types for the frontend
export interface TemplateCategory {
  id: number;
  name: string;
  icon?: string;
}

export interface TemplateAuthor {
  username: string;
}

export interface TemplateMetadata {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  business_category: string;
  custom_tags: string[];
}

export interface Template {
  n8n_id: number;
  name: string;
  description: string;
  tags: string[];
  categories: TemplateCategory[];
  node_count: number;
  trigger_count: number;
  author: TemplateAuthor | null;
  workflow_json: Record<string, any>;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  popularity_score: number;
  our_metadata: TemplateMetadata;
}

export interface BusinessCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface TemplateSearchParams {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface TemplateSearchResponse {
  templates: Template[];
  count: number;
  query?: string;
  category?: string;
}

export interface TemplateStats {
  total_templates: number;
  categories: Array<{
    _id: string;
    count: number;
  }>;
}

export interface CategoriesResponse {
  categories: BusinessCategory[];
  total_templates: number;
}

export interface SyncStatus {
  in_progress: boolean;
  last_sync?: string;
  total_syncs: number;
  last_sync_templates: number;
  last_sync_duration: number;
}

export interface SyncResponse {
  message: string;
  status: 'initiated' | 'in_progress';
}