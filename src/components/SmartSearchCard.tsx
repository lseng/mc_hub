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
      className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4 mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Search size={16} className="text-blue-600" />
        <span className="font-medium text-gray-900">
          {hasResults ? `Found ${resourceCount} results` : 'Try searching for'}
        </span>
      </div>
      
      {hasResults ? (
        <div className="text-sm text-gray-600">
          Search results for "<span className="font-medium">{searchQuery}</span>"
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
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
                className="flex items-start gap-2 p-2 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200 text-left hover:shadow-sm"
              >
                <Icon size={14} className={`flex-shrink-0 mt-0.5 ${suggestion.color}`} />
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {suggestion.text}
                  </div>
                  <div className="text-xs text-gray-500 leading-tight">
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