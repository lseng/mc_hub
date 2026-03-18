import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const hardcodedEvents = [
  {
    id: '1',
    title: 'MC Leader Training',
    date: '2026-01-10',
    type: 'training',
    description: 'Training session for MC leaders'
  },
  {
    id: '2', 
    title: 'Winter Expo',
    date: '2026-01-08',
    type: 'expo',
    description: 'Winter motorcycle expo'
  },
  {
    id: '3',
    title: 'Brochure Deadline',
    date: '2025-12-17',
    type: 'deadline',
    description: 'Submit brochure information'
  }
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getEventColor = (type: string) => {
  switch (type) {
    case 'training': return 'bg-purple-500 text-white border-purple-600';
    case 'expo': return 'bg-blue-500 text-white border-blue-600';
    case 'deadline': return 'bg-red-500 text-white border-red-600';
    default: return 'bg-gray-500 text-white border-gray-600';
  }
};

export function SimpleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // January 2026
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
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
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = hardcodedEvents.filter(event => event.date === dateStr);
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
  
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="flex-1 p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0 mb-2 bg-gray-50 rounded-lg overflow-hidden">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-3 border-r border-b border-gray-200 last:border-r-0 ${
                index >= calendarDays.length - 7 ? 'border-b-0' : ''
              } ${
                day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-semibold text-gray-900 mb-3 flex justify-between items-center">
                    <span>{day.day}</span>
                    {day.day === 10 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {day.events.map(event => (
                      <div
                        key={event.id}
                        className={`p-2 rounded-md text-xs ${getEventColor(event.type)} shadow-sm`}
                      >
                        <div className="font-semibold truncate leading-tight">{event.title}</div>
                        {event.description && (
                          <div className="text-xs opacity-75 mt-1 truncate">{event.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}