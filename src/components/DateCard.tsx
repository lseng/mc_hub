import { memo } from 'react';
import { motion } from 'motion/react';
import { DateItem } from '../types/app';
import { SearchHighlight } from './SearchHighlight';
import { Calendar, Clock, Users, GraduationCap, CalendarPlus } from 'lucide-react';

interface DateCardProps {
  date: DateItem;
  index: number;
  searchQuery?: string;
}

export const DateCard = memo(function DateCard({
  date,
  index,
  searchQuery = ''
}: DateCardProps) {
  const getDateIcon = () => {
    if (date.isDeadline) {
      return <Clock className="w-4 h-4" />;
    }
    if (date.isTraining) {
      return <GraduationCap className="w-4 h-4" />;
    }
    if (date.isExpo) {
      return <Users className="w-4 h-4" />;
    }
    return <Calendar className="w-4 h-4" />;
  };

  const handleAddToCalendar = () => {
    // Create calendar event data
    const startDate = new Date(date.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(new Date(date.date).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(date.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(date.description || '')}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut"
      }}
      className="relative p-3"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getDateIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="font-semibold text-sm">
                <SearchHighlight text={date.date} searchQuery={searchQuery} />
              </div>
              <div className="text-sm mt-1">
                <SearchHighlight text={date.title} searchQuery={searchQuery} />
              </div>
              {date.description && (
                <div className="text-xs mt-1">
                  <SearchHighlight text={date.description} searchQuery={searchQuery} />
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                {date.semester} {date.year}
              </span>
              <button
                onClick={handleAddToCalendar}
                className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                title="Add to calendar"
              >
                <span className="text-xs" style={{ color: '#406780' }}>Add to Calendar</span>
                <CalendarPlus className="w-4 h-4" style={{ color: '#406780' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});