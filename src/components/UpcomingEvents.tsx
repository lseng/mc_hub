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

function getEventStyles(date: DateItem) {
  if (date.isTraining) return {
    cardBg: 'linear-gradient(to bottom right, #faf5ff, #f5f3ff, #f3e8ff)',
    textColor: '#6b21a8',
    borderColor: 'rgba(167, 139, 250, 0.3)',
    iconBg: 'linear-gradient(to bottom right, #a855f7, #8b5cf6, #9333ea)',
  };
  if (date.isExpo) return {
    cardBg: 'linear-gradient(to bottom right, #eff6ff, #f0f9ff, #dbeafe)',
    textColor: '#1e40af',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    iconBg: 'linear-gradient(to bottom right, #60a5fa, #38bdf8, #3b82f6)',
  };
  if (date.isDeadline) return {
    cardBg: 'linear-gradient(to bottom right, #fef2f2, #fff1f2, #fecdd3)',
    textColor: '#991b1b',
    borderColor: 'rgba(252, 165, 165, 0.3)',
    iconBg: 'linear-gradient(to bottom right, #ef4444, #f43f5e, #dc2626)',
  };
  return {
    cardBg: 'linear-gradient(to bottom right, #f9fafb, #f8fafc, #f3f4f6)',
    textColor: '#1f2937',
    borderColor: 'rgba(209, 213, 219, 0.5)',
    iconBg: 'linear-gradient(to bottom right, #9ca3af, #94a3b8, #6b7280)',
  };
}

function isUpcoming(dateString: string, year: number): boolean {
  try {
    const now = new Date();
    const eventDate = new Date(`${dateString} ${year}`);
    const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= -1 && daysDiff <= 60;
  } catch {
    return false;
  }
}

export function UpcomingEvents({ dates }: UpcomingEventsProps) {
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
    .slice(0, 3);

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
          const styles = getEventStyles(date);
          
          return (
            <motion.div
              key={date.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -1 }}
              className="relative p-3 rounded-xl border transition-all duration-300 hover:shadow-lg overflow-hidden backdrop-blur-sm"
              style={{
                background: styles.cardBg,
                borderColor: styles.borderColor,
                color: styles.textColor,
              }}
            >
              <div className="relative z-10 flex items-start gap-3">
                <div 
                  className="flex-shrink-0 p-1.5 rounded-lg shadow-sm"
                  style={{ background: styles.iconBg }}
                >
                  <Icon size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {date.date}
                    </span>
                    <span 
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.6)' }}
                    >
                      {date.semester} {date.year}
                    </span>
                  </div>
                  <div className="font-semibold text-sm mb-1">
                    {date.title}
                  </div>
                  {date.description && (
                    <div className="text-xs" style={{ opacity: 0.75 }}>
                      {date.description}
                    </div>
                  )}
                </div>
                <motion.button
                  onClick={() => {
                    const eventDate = new Date(`${date.date} ${date.year}`);
                    const startDate = eventDate.toLocaleDateString('en-CA').replace(/-/g, '');
                    const nextDay = new Date(eventDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    const endDate = nextDay.toLocaleDateString('en-CA').replace(/-/g, '');
                    
                    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(date.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(date.description || '')}&ctz=America/Los_Angeles`;
                    window.open(googleCalendarUrl, '_blank');
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2 rounded-lg transition-all duration-200 hover:shadow-md shadow-sm group"
                  style={{ background: styles.iconBg }}
                  title="Add to calendar"
                >
                  <CalendarPlus size={14} className="text-white" />
                  <div 
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
