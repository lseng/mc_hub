import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import svgPaths from "../imports/svg-fv163o9m0l";
import { DateCard } from './DateCard';
import { DateItem } from '../types/app';

interface CollapsibleDatesSectionProps {
  title: string;
  dates: DateItem[];
  defaultExpanded?: boolean;
  searchQuery?: string;
}

// Memoize the component to prevent unnecessary re-renders
export const CollapsibleDatesSection = memo(function CollapsibleDatesSection({ 
  title, 
  dates,
  defaultExpanded = false,
  searchQuery = ''
}: CollapsibleDatesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Don't render section if no dates match
  if (dates.length === 0) {
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
                  key={dates.length} // Re-animate when count changes
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium min-w-[24px] text-center"
                >
                  {dates.length}
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
              {dates.map((date, index) => (
                <DateCard
                  key={date.id}
                  date={date}
                  index={index}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});