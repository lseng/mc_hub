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
    // Parse the date display (e.g., "March 15") and create a proper date
    // For now, default to current year and 12 PM Pacific time
    const currentYear = new Date().getFullYear();
    const parsedDate = new Date(`${date.date} ${currentYear} 12:00 PM PST`);
    
    // Create all-day event (Google Calendar format: YYYYMMDD for all-day events)
    const startDate = parsedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const formattedStart = startDate.replace(/-/g, '');
    const nextDay = new Date(parsedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const formattedEnd = nextDay.toLocaleDateString('en-CA').replace(/-/g, '');
    
    // Google Calendar URL for all-day event
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(date.title)}&dates=${formattedStart}/${formattedEnd}&details=${encodeURIComponent(date.description || '')}&ctz=America/Los_Angeles`;
    
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