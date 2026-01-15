import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import svgPaths from "../imports/svg-fv163o9m0l";
import { ResourceCard } from './ResourceCard';

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

interface CollapsibleSectionProps {
  title: string;
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
  selectedResourceId: string | null;
  defaultExpanded?: boolean;
  searchQuery?: string;
}

// Memoize the component to prevent unnecessary re-renders
export const CollapsibleSection = memo(function CollapsibleSection({ 
  title, 
  resources, 
  onResourceClick, 
  selectedResourceId,
  defaultExpanded = false,
  searchQuery = ''
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Don't render section if no resources match
  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <motion.button
        onClick={toggleExpanded}
        whileTap={{ opacity: 0.9 }}
        className="bg-[#406780] relative rounded-lg shrink-0 w-full hover:bg-[#355a73] transition-all duration-200 group"
      >
        <motion.div
          whileHover={{ boxShadow: '0 4px 12px rgba(64, 103, 128, 0.25)' }}
          transition={{ duration: 0.2 }}
          className="flex flex-row items-center relative size-full"
        >
          <div className="box-border content-stretch flex flex-row gap-3 items-center justify-between p-[12px] relative w-full">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative shrink-0 size-5"
              >
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <g>
                    <path 
                      d={svgPaths.p38e550f0}
                      fill="var(--fill-0, #FAFAFA)" 
                    />
                  </g>
                </svg>
              </motion.div>
              <div className="flex items-center gap-2">
                <div className="font-['Inter:Bold_Italic',_sans-serif] font-bold italic leading-[0] relative text-[16px] text-left text-neutral-50 uppercase">
                  <p className="block leading-[normal]">{title}</p>
                </div>
                <motion.div
                  key={resources.length} // Re-animate when count changes
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium min-w-[24px] text-center"
                >
                  {resources.length}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="box-border content-stretch flex flex-col gap-3 items-start justify-start p-0 relative shrink-0 w-full overflow-hidden"
          >
            <div className="space-y-1.5 w-full px-2 py-1">
              {resources.map((resource, index) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onClick={() => onResourceClick(resource)}
                  searchQuery={searchQuery}
                  index={index}
                  isSelected={selectedResourceId === resource.id}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});