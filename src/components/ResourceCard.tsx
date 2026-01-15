import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Video, 
  FileDown, 
  Globe, 
  Mic, 
  Image as ImageIcon, 
  ClipboardList,
  Rss,
  File,
  Brain
} from 'lucide-react';
import { SearchHighlight } from './SearchHighlight';

interface Resource {
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

interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
  searchQuery?: string;
  index?: number;
  isSelected?: boolean;
}

function getResourceIcon(type: string) {
  switch (type) {
    case 'youtube':
      return <Video size={16} className="text-red-600" />;
    case 'pdf':
      return <FileDown size={16} className="text-red-500" />;
    case 'google_doc':
      return <FileText size={16} className="text-blue-600" />;
    case 'church_center_form':
      return <ClipboardList size={16} className="text-green-600" />;
    case 'webpage':
      return <Globe size={16} className="text-blue-500" />;
    case 'audio':
      return <Mic size={16} className="text-purple-600" />;
    case 'image':
      return <ImageIcon size={16} className="text-orange-500" />;
    case 'rss':
      return <Rss size={16} className="text-orange-600" />;
    default:
      return <File size={16} className="text-gray-500" />;
  }
}

function formatDate(dateString: string) {
  try {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return '';
  }
}

export function ResourceCard({ resource, onClick, searchQuery = '', index = 0, isSelected = false }: ResourceCardProps) {
  // Add null checks for resource properties
  const title = resource.title || 'Untitled Resource';
  const description = resource.description || 'No description available';
  const roles = resource.roles || [];
  const dateAdded = resource.date_added || '';
  const [hasKnowledgeBase, setHasKnowledgeBase] = useState(false);

  // Check if resource has knowledge base content (only for document types)
  useEffect(() => {
    if (['pdf', 'google_doc'].includes(resource.type)) {
      const checkKB = async () => {
        try {
          const { projectId } = await import('../utils/supabase/info');
          const { publicAnonKey } = await import('../utils/supabase/info');
          
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e08b724b/kb-query`, {
            method: 'POST',
            headers: { 
              'content-type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ resource_id: resource.id })
          });
          
          if (response.ok) {
            const data = await response.json();
            setHasKnowledgeBase(!!data.answer);
          }
        } catch (err) {
          // Silently fail - no KB content available
        }
      };
      
      checkKB();
    }
  }, [resource.id, resource.type]);

  // Determine border and background styles based on selected/hover states
  // Use consistent border width (2px) to prevent layout shifts
  const getBorderClasses = () => {
    if (isSelected) {
      return 'border-[#406780] border-2 shadow-md bg-blue-50/30';
    }
    return 'border-transparent border-2 hover:border-[#406780] hover:shadow-md';
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: "easeOut"
      }}
      onClick={onClick}
      data-resource-id={resource.id}
      className={`
        bg-white relative rounded-lg shrink-0 w-full hover:bg-gray-50 
        transition-all duration-150 cursor-pointer group mx-0.5
        ${getBorderClasses()}
      `}
    >
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-row gap-3 items-start justify-start px-3 py-2 relative w-full">
          {/* Thumbnail or Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
            {resource.thumbnail_url ? (
              <img 
                src={resource.thumbnail_url} 
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={resource.thumbnail_url ? 'hidden' : 'flex items-center justify-center'}>
              {getResourceIcon(resource.type)}
            </div>
            
            {/* AI Knowledge Base Indicator */}
            {hasKnowledgeBase && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#406780] rounded-full flex items-center justify-center">
                <Brain size={10} className="text-white" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="basis-0 box-border content-stretch flex flex-col gap-1 grow items-start justify-center leading-[0] min-h-px min-w-px not-italic p-0 relative shrink-0 text-[#406780] text-[13px] text-left">
            <div className="font-['Inter:Bold',_sans-serif] font-bold relative shrink-0 w-full text-left text-[13px]">
              <SearchHighlight 
                text={title} 
                searchQuery={searchQuery}
                className="block leading-[normal]"
              />
            </div>
            <div className="font-['Inter:Regular',_sans-serif] font-normal min-w-full relative shrink-0 line-clamp-2 text-left text-[12px]">
              <SearchHighlight 
                text={description} 
                searchQuery={searchQuery}
                className="block leading-[normal] text-gray-600"
              />
            </div>
            
            {/* Metadata */}
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
              {roles.length > 0 && (
                <div className="flex gap-1">
                  {roles.slice(0, 2).map(role => (
                    <span key={role} className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                      {role}
                    </span>
                  ))}
                  {roles.length > 2 && (
                    <span className="text-gray-400">+{roles.length - 2}</span>
                  )}
                </div>
              )}
              {dateAdded && (
                <span className="ml-auto">{formatDate(dateAdded)}</span>
              )}
            </div>
          </div>
          
          {/* Arrow - No position animations, only opacity changes */}
          <div
            className={`
              flex items-center text-[#406780] transition-opacity duration-150
              ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </motion.button>
  );
}