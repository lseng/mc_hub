import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    case 'training': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
    case 'expo': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    case 'deadline': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
    default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
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
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white px-6 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[#406780] text-white rounded-lg font-medium hover:bg-[#355a6d] transition-colors shadow-md">
              Add Event
            </button>
          </div>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="flex-1 p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0 mb-0 bg-gradient-to-r from-[#406780] to-[#4a7590] rounded-t-xl overflow-hidden shadow-lg">
          {dayNames.map(day => (
            <div key={day} className="p-4 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-white/20 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0 border-2 border-gray-200 rounded-b-xl shadow-lg overflow-hidden bg-white">
          {calendarDays.map((day, index) => {
            const isToday = day && day.day === 10; // Mock today
            
            return (
              <div
                key={index}
                className={`min-h-[140px] p-4 border-r border-b border-gray-200 last:border-r-0 transition-all duration-200 ${
                  index >= calendarDays.length - 7 ? 'border-b-0' : ''
                } ${
                  !day 
                    ? 'bg-gray-50' 
                    : isToday
                      ? 'bg-gradient-to-br from-[#406780] to-[#4a7590] text-white cursor-pointer shadow-inner'
                      : 'bg-white hover:bg-blue-50 cursor-pointer hover:shadow-md'
                }`}
              >
                {day && (
                  <>
                    <div className={`text-lg font-bold mb-3 flex justify-between items-center ${
                      isToday ? 'text-white' : 'text-gray-900'
                    }`}>
                      <span>{day.day}</span>
                      {isToday && (
                        <div className="w-3 h-3 bg-white rounded-full opacity-80 animate-pulse"></div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {day.events.map(event => (
                        <div
                          key={event.id}
                          className={`p-2.5 rounded-lg text-xs shadow-md transform hover:scale-105 transition-all duration-200 ${getEventColor(event.type)}`}
                        >
                          <div className="font-bold truncate leading-tight">{event.title}</div>
                          {event.description && (
                            <div className="text-xs opacity-90 mt-1 truncate">{event.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}