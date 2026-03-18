import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Users, GraduationCap, CalendarPlus } from 'lucide-react';
import { DateItem } from '../types/app';

interface UpcomingEventsProps {
  dates: DateItem[];
}

function getEventIcon(date: DateItem) {
  if (date.isTraining) return GraduationCap;
  if (date.isExpo) return Users; 
  if (date.isDeadline) return Clock;
  return Calendar;
}

function getEventColor(date: DateItem) {
  if (date.isTraining) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (date.isExpo) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (date.isDeadline) return 'bg-red-50 text-red-700 border-red-200'; 
  return 'bg-gray-50 text-gray-700 border-gray-200';
}

function isUpcoming(dateString: string, year: number): boolean {
  try {
    // Parse date like "March 1" with current or given year
    const now = new Date();
    const eventDate = new Date(`${dateString} ${year}`);
    const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= -1 && daysDiff <= 60; // Show events from yesterday up to 60 days ahead
  } catch {
    return false;
  }
}

export function UpcomingEvents({ dates }: UpcomingEventsProps) {
  // Filter to only upcoming events
  const upcomingEvents = dates
    .filter(date => isUpcoming(date.date, date.year))
    .sort((a, b) => {
      try {
        const dateA = new Date(`${a.date} ${a.year}`);
        const dateB = new Date(`${b.date} ${b.year}`);
        return dateA.getTime() - dateB.getTime();
      } catch {
        return 0;
      }
    })
    .slice(0, 3); // Show next 3 events

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <h3 className="font-['Inter:Bold_Italic',_sans-serif] font-bold italic text-[#414141] text-lg mb-3 uppercase">
        Upcoming Events
      </h3>
      
      <div className="space-y-2">
        {upcomingEvents.map((date, index) => {
          const Icon = getEventIcon(date);
          const colorClass = getEventColor(date);
          
          return (
            <motion.div
              key={date.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-3 rounded-lg border transition-all duration-200 hover:shadow-md
                ${colorClass}
              `}
            >
              <div className="flex items-start gap-3">
                <Icon size={16} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {date.date}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-white/60 rounded">
                      {date.semester} {date.year}
                    </span>
                  </div>
                  <div className="font-semibold text-sm mb-1">
                    {date.title}
                  </div>
                  {date.description && (
                    <div className="text-xs opacity-75">
                      {date.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    // Parse date and create calendar event
                    const eventDate = new Date(`${date.date} ${date.year}`);
                    const startDate = eventDate.toLocaleDateString('en-CA').replace(/-/g, '');
                    const nextDay = new Date(eventDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    const endDate = nextDay.toLocaleDateString('en-CA').replace(/-/g, '');
                    
                    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(date.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(date.description || '')}&ctz=America/Los_Angeles`;
                    window.open(googleCalendarUrl, '_blank');
                  }}
                  className="p-1.5 hover:bg-white/60 rounded-md transition-colors"
                  title="Add to calendar"
                >
                  <CalendarPlus size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}