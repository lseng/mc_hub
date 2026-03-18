import { motion } from 'motion/react';
import { ProfessionalCalendar } from '../ProfessionalCalendar';

interface CalendarPageProps {
  onBack?: () => void;
}

export function CalendarPage({ onBack }: CalendarPageProps) {
  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
  };

  const handleDateClick = (dateInfo: any) => {
    console.log('Date clicked:', dateInfo);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-white"
    >
      <ProfessionalCalendar
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
      />
    </motion.div>
  );
}