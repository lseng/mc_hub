import { motion } from 'motion/react';
import { Search, TrendingUp, Clock, Users, FileText, Calendar } from 'lucide-react';

interface SmartSearchCardProps {
  searchQuery: string;
  resourceCount: number;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const smartSuggestions = [
  { 
    text: "forms", 
    icon: FileText, 
    description: "Applications and administrative forms",
    color: "text-blue-600"
  },
  { 
    text: "training", 
    icon: Users, 
    description: "Training materials and guides", 
    color: "text-purple-600"
  },
  { 
    text: "deadlines", 
    icon: Clock, 
    description: "Important dates and deadlines",
    color: "text-red-600"
  },
  { 
    text: "weekly guide", 
    icon: Calendar, 
    description: "Current week's MC content",
    color: "text-green-600"
  }
];

export function SmartSearchCard({ searchQuery, resourceCount, suggestions, onSuggestionClick }: SmartSearchCardProps) {
  const hasResults = resourceCount > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100/50 rounded-xl p-4 mb-4 overflow-hidden backdrop-blur-sm"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-indigo-400/5 to-purple-400/5" />
      <div className="relative z-10 flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
          <Search size={14} className="text-white" />
        </div>
        <span className="font-semibold text-gray-900">
          {hasResults ? `Found ${resourceCount} results` : 'Try searching for'}
        </span>
      </div>
      
      {hasResults ? (
        <div className="relative z-10 text-sm text-gray-600">
          Search results for "<span className="font-medium">{searchQuery}</span>"
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-2 gap-2">
          {smartSuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <motion.button
                key={suggestion.text}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSuggestionClick(suggestion.text)}
                className="relative flex items-start gap-2 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/50 hover:border-blue-200/70 transition-all duration-300 text-left hover:shadow-lg hover:bg-white/90 overflow-hidden"
              >
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <div className={`relative z-10 flex-shrink-0 p-1.5 rounded-lg bg-gradient-to-br ${suggestion.color === 'text-blue-600' ? 'from-blue-400 to-blue-600' : suggestion.color === 'text-purple-600' ? 'from-purple-400 to-purple-600' : suggestion.color === 'text-red-600' ? 'from-red-400 to-red-600' : 'from-green-400 to-green-600'} shadow-sm`}>
                  <Icon size={12} className="text-white" />
                </div>
                <div className="relative z-10">
                  <div className="font-semibold text-sm text-gray-900">
                    {suggestion.text}
                  </div>
                  <div className="text-xs text-gray-600 leading-tight">
                    {suggestion.description}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}