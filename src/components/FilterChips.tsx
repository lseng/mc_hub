import { motion } from 'motion/react';

interface FilterChipsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const roleFilters = [
  { id: 'All', label: 'All', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { id: 'Member', label: 'Member', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { id: 'Apprentice', label: 'Apprentice', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { id: 'Leader', label: 'Leader', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
  { id: 'Coach', label: 'Coach', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' }
];

export function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm p-2 -m-2 rounded-lg">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {roleFilters.map((filter) => {
          const isActive = activeFilter === filter.id;
          
          return (
            <motion.button
              key={filter.id}
              layout
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange(filter.id)}
              className={`
                relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap 
                transition-all duration-200 border
                ${isActive
                  ? 'bg-[#406780] text-white border-[#406780] shadow-lg'
                  : `${filter.color} border-transparent`
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute inset-0 bg-[#406780] rounded-full"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <span className="relative z-10">{filter.label}</span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Scroll indicator */}
      <div className="flex justify-center mt-1">
        <div className="w-8 h-0.5 bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}