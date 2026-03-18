import { useState, useEffect } from 'react';
import { makeServerRequest } from '../utils/supabase/client';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
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

interface DateItem {
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

const eventTypeColors = {
  training: { bg: '#7C3AED', border: '#7C3AED', text: '#FFFFFF' },
  expo: { bg: '#2563EB', border: '#2563EB', text: '#FFFFFF' },
  deadline: { bg: '#DC2626', border: '#DC2626', text: '#FFFFFF' },
  race: { bg: '#059669', border: '#059669', text: '#FFFFFF' },
  social: { bg: '#D97706', border: '#D97706', text: '#FFFFFF' },
  meeting: { bg: '#0891B2', border: '#0891B2', text: '#FFFFFF' },
};

// Convert DateItems to FullCalendar events with null safety
const convertToCalendarEvents = (dates: DateItem[]): CalendarEvent[] => {
  return dates
    .filter(date => date && date.id && date.title && date.date && date.year) // Filter out invalid dates
    .map(date => {
      try {
        // Parse date string like "March 15" into proper ISO date
        const eventDate = new Date(`${date.date} ${date.year}`);
        if (isNaN(eventDate.getTime())) {
          throw new Error('Invalid date');
        }
        const isoDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const type = date.isTraining ? 'training' 
                    : date.isExpo ? 'expo' 
                    : date.isDeadline ? 'deadline' 
                    : 'meeting';
        
        const colors = eventTypeColors[type];

        return {
          id: String(date.id),
          title: String(date.title),
          start: isoDate,
          allDay: true,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          textColor: colors.text,
          className: `event-${type}`,
          extendedProps: {
            description: String(date.description || ''),
            type,
            semester: String(date.semester),
            year: Number(date.year),
          }
        };
      } catch (error) {
        console.warn('Invalid date item:', date, error);
        return null;
      }
    })
    .filter(Boolean) as CalendarEvent[]; // Remove null entries
};

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from calendar-events API first
        try {
          const calendarData = await makeServerRequest('/calendar-events');
          if (calendarData && Array.isArray(calendarData) && calendarData.length > 0) {
            // Convert API response to calendar events with proper null checking
            const convertedEvents = calendarData
              .filter(event => event && event.id && event.title) // Filter out null/invalid events
              .map((event: any) => {
                const type = (event.type && typeof event.type === 'string') ? event.type : 'meeting';
                const colors = eventTypeColors[type as keyof typeof eventTypeColors] || eventTypeColors.meeting;
                
                return {
                  id: String(event.id),
                  title: String(event.title || event.summary || 'Untitled Event'),
                  start: event.start || event.dateTime || new Date().toISOString(),
                  end: event.end || undefined,
                  allDay: event.allDay !== false, // Default to all-day unless explicitly false
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  textColor: colors.text,
                  className: `event-${type}`,
                  extendedProps: {
                    description: String(event.description || ''),
                    type,
                    semester: String(event.semester || ''),
                    year: Number(event.year) || new Date().getFullYear(),
                    location: event.location ? String(event.location) : undefined,
                    organizer: event.organizer ? String(event.organizer) : undefined,
                    attendees: typeof event.attendees === 'number' ? event.attendees : undefined
                  }
                };
              });
            
            if (convertedEvents.length > 0) {
              setEvents(convertedEvents);
              return;
            }
          }
        } catch (apiError) {
          console.warn('Calendar API failed, falling back to static data:', apiError);
        }
        
        // Fallback to static data
        const { fallbackDates } = await import('../data/importantDates');
        const fallbackEvents = convertToCalendarEvents(fallbackDates);
        setEvents(fallbackEvents);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load calendar events');
        console.error('Calendar events error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
}