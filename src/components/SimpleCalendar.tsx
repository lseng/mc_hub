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
    case 'training': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'expo': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
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
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-2 border border-gray-100 rounded ${
                day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {day.day}
                  </div>
                  <div className="space-y-1">
                    {day.events.map(event => (
                      <div
                        key={event.id}
                        className={`p-1 rounded text-xs ${getEventColor(event.type)} border`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
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