import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Users,
  GraduationCap,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

interface ProfessionalCalendarProps {
  onEventClick?: (event: any) => void;
  onDateClick?: (dateInfo: any) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO 8601 date string
  end?: string;
  allDay?: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  className?: string;
  extendedProps: {
    description: string;
    type: 'training' | 'expo' | 'deadline' | 'meeting' | 'race' | 'social';
    semester: string;
    year: number;
    location?: string;
    organizer?: string;
    attendees?: number;
  };
}

const eventTypeColors = {
  training: { bg: '#7C3AED', border: '#7C3AED', text: '#FFFFFF' },
  expo: { bg: '#2563EB', border: '#2563EB', text: '#FFFFFF' },
  deadline: { bg: '#DC2626', border: '#DC2626', text: '#FFFFFF' },
  race: { bg: '#059669', border: '#059669', text: '#FFFFFF' },
  social: { bg: '#D97706', border: '#D97706', text: '#FFFFFF' },
  meeting: { bg: '#0891B2', border: '#0891B2', text: '#FFFFFF' },
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'training': return GraduationCap;
    case 'expo': return Users;
    case 'deadline': return AlertCircle;
    case 'race': return Calendar;
    case 'social': return Users;
    case 'meeting': return Users;
    default: return CalendarIcon;
  }
};

export function ProfessionalCalendar({ onEventClick, onDateClick }: ProfessionalCalendarProps) {
  const [view, setView] = useState('dayGridMonth');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);
  
  const { events: calendarEvents, loading, error } = useCalendarEvents();

  const handleEventClick = useCallback((clickInfo: any) => {
    const event = clickInfo.event;
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end?.toISOString(),
      allDay: event.allDay,
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      textColor: event.textColor,
      extendedProps: event.extendedProps
    };
    
    setSelectedEvent(calendarEvent);
    setShowEventDetail(true);
    onEventClick?.(calendarEvent);
  }, [onEventClick]);

  const handleDateClick = useCallback((dateInfo: any) => {
    onDateClick?.(dateInfo);
  }, [onDateClick]);

  const navigateCalendar = (direction: 'prev' | 'next' | 'today') => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    switch (direction) {
      case 'prev':
        calendarApi.prev();
        break;
      case 'next':
        calendarApi.next();
        break;
      case 'today':
        calendarApi.today();
        break;
    }
  };

  const changeView = (newView: string) => {
    setView(newView);
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(newView);
  };

  const addToCalendar = (event: CalendarEvent) => {
    const startDate = new Date(event.start).toLocaleDateString('en-CA').replace(/-/g, '');
    const endDate = event.end ? new Date(event.end).toLocaleDateString('en-CA').replace(/-/g, '') : startDate;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.extendedProps.description || '')}&ctz=America/Los_Angeles`;
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Custom Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left: Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateCalendar('prev')}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => navigateCalendar('next')}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
            
            <button
              onClick={() => navigateCalendar('today')}
              className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            
            <h2 className="text-xl font-semibold text-gray-900 ml-2">
              MC Calendar
            </h2>
          </div>

          {/* Right: View Switcher and Add Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'timeGridDay', label: 'Day' },
                { key: 'timeGridWeek', label: 'Week' },
                { key: 'dayGridMonth', label: 'Month' },
                { key: 'listWeek', label: 'List' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => changeView(key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    view === key 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <button className="flex items-center gap-2 bg-[#406780] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#355a6d] transition-colors">
              <Plus size={16} />
              Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-[#406780]" />
              <span className="text-gray-600">Loading calendar events...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 z-10">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-red-800 text-sm">
                {error}
              </span>
            </div>
          </div>
        )}
        
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false} // We use custom header
          events={calendarEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="100%"
          aspectRatio={1.35}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={true}
          nowIndicator={true}
          selectMirror={true}
          dayMaxEvents={3}
          moreLinkClick="popover"
          eventDisplay="block"
          displayEventTime={true}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          dayHeaderFormat={{ weekday: 'short' }}
          // Custom styling via CSS classes
          dayHeaderClassNames="text-xs font-medium text-gray-600 uppercase tracking-wide py-3"
          eventClassNames="rounded-md text-sm font-medium"
          dayCellClassNames="border-gray-100"
        />

        {/* Event Detail Panel */}
        <AnimatePresence>
          {showEventDetail && selectedEvent && (
            <>
              {/* Backdrop for mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                onClick={() => setShowEventDetail(false)}
              />
              
              {/* Detail Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 w-full lg:w-80 h-full bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: selectedEvent.backgroundColor }}
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                          {selectedEvent.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedEvent.extendedProps.type.charAt(0).toUpperCase() + 
                           selectedEvent.extendedProps.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEventDetail(false)}
                      className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CalendarIcon size={16} />
                      <span>
                        {new Date(selectedEvent.start).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {selectedEvent.extendedProps.description && (
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {selectedEvent.extendedProps.description}
                        </p>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Clock size={16} />
                          <span>{selectedEvent.extendedProps.semester} {selectedEvent.extendedProps.year}</span>
                        </div>
                        
                        {selectedEvent.extendedProps.location && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <MapPin size={16} />
                            <span>{selectedEvent.extendedProps.location}</span>
                          </div>
                        )}
                        
                        {selectedEvent.extendedProps.organizer && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <User size={16} />
                            <span>Organizer: {selectedEvent.extendedProps.organizer}</span>
                          </div>
                        )}
                        
                        {selectedEvent.extendedProps.attendees && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Users size={16} />
                            <span>{selectedEvent.extendedProps.attendees} Attendees</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-100 pt-4">
                      <button
                        onClick={() => addToCalendar(selectedEvent)}
                        className="w-full bg-[#406780] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#355a6d] transition-colors"
                      >
                        Add to Calendar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}