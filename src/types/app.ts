export interface Resource {
  id: string;
  title: string;
  type: 'webpage' | 'youtube' | 'pdf' | 'google_doc' | 'church_center_form' | 'rss' | 'audio' | 'image' | 'other';
  url: string;
  description: string;
  date_added: string;
  roles: string[];
  tags: string[];
  section: 'forms' | 'documents' | 'media' | 'other';
  thumbnail_url?: string;
  position?: number;
}

export interface DateItem {
  id: string;
  date: string;
  title: string;
  description: string;
  semester: 'fall' | 'winter' | 'spring';
  year: number;
  isDeadline?: boolean;
  isTraining?: boolean;
  isExpo?: boolean;
}

export type MobileView = 'resources' | 'resource-detail';