import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users, GraduationCap, CalendarPlus } from 'lucide-react';
import { DateItem } from '../types/app';

interface CalendarProps {
  dates: DateItem[];
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'deadline' | 'training' | 'expo' | 'default';
  semester: string;
  year: number;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseEventDate(dateString: string, year: number): Date | null {
  try {
    // Handle date ranges like "January 8 & 11" - take first date
    const cleanDate = dateString.split(' & ')[0];
    return new Date(`${cleanDate} ${year}`);
  } catch {
    return null;
  }
}

function getEventIcon(type: string) {
  switch (type) {
    case 'training': return GraduationCap;
    case 'expo': return Users;
    case 'deadline': return Clock;
    default: return CalendarIcon;
  }
}

function getEventColor(type: string) {
  switch (type) {
    case 'training': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'expo': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function Calendar({ dates }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');

  // Convert DateItems to CalendarEvents
  const events: CalendarEvent[] = dates.map(date => {
    const parsedDate = parseEventDate(date.date, date.year);
    if (!parsedDate) return null;

    return {
      id: date.id,
      title: date.title,
      description: date.description,
      date: parsedDate,
      type: date.isDeadline ? 'deadline' : date.isTraining ? 'training' : date.isExpo ? 'expo' : 'default',
      semester: date.semester,
      year: date.year
    };
  }).filter(Boolean) as CalendarEvent[];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get events for current month
  const monthEvents = events.filter(event => {
    const eventMonth = event.date.getMonth();
    const eventYear = event.date.getFullYear();
    return eventMonth === currentMonth && eventYear === currentYear;
  });

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayEvents = monthEvents.filter(event => 
      event.date.getDate() === day
    );
    calendarDays.push({ day, date, events: dayEvents });
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const addToCalendar = (event: CalendarEvent) => {
    const startDate = event.date.toLocaleDateString('en-CA').replace(/-/g, '');
    const nextDay = new Date(event.date);
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = nextDay.toLocaleDateString('en-CA').replace(/-/g, '');
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description || '')}&ctz=America/Los_Angeles`;
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Inter:Bold_Italic',_sans-serif] font-bold italic text-[#414141] text-xl uppercase">
            MC Calendar
          </h2>
          
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {(['month', 'week', 'list'] as const).map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  view === viewType 
                    ? 'bg-[#406780] text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {view === 'month' && (
            <motion.div
              key="month"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[80px] p-1 border border-gray-100 rounded ${
                      day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                    }`}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {day.day}
                        </div>
                        <div className="space-y-1">
                          {day.events.map(event => {
                            const Icon = getEventIcon(event.type);
                            return (
                              <div
                                key={event.id}
                                className={`p-1 rounded text-xs ${getEventColor(event.type)} border`}
                              >
                                <div className="flex items-center gap-1">
                                  <Icon size={10} />
                                  <span className="truncate">{event.title}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3 max-h-96 overflow-y-auto"
            >
              {monthEvents.length > 0 ? (
                monthEvents
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((event, index) => {
                    const Icon = getEventIcon(event.type);
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-white rounded-lg">
                              <Icon size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm mb-1">
                                {event.title}
                              </div>
                              <div className="text-sm opacity-75 mb-2">
                                {event.date.toLocaleDateString('en-US', { 
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              {event.description && (
                                <div className="text-xs opacity-75">
                                  {event.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => addToCalendar(event)}
                            className="p-2 bg-white hover:bg-gray-50 rounded-lg transition-colors"
                            title="Add to calendar"
                          >
                            <CalendarPlus size={16} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No events this month</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}