import { motion } from 'motion/react';
import { Search, TrendingUp, Clock, Users, FileText, Calendar } from 'lucide-react';

interface SmartSearchCardProps {
  searchQuery: string;
  resourceCount: number;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const iconGradients: Record<string, string> = {
  'text-blue-600': 'linear-gradient(to bottom right, #60a5fa, #3b82f6)',
  'text-purple-600': 'linear-gradient(to bottom right, #a855f7, #9333ea)',
  'text-red-600': 'linear-gradient(to bottom right, #ef4444, #dc2626)',
  'text-green-600': 'linear-gradient(to bottom right, #4ade80, #16a34a)',
};

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
      className="relative rounded-xl p-4 mb-4 overflow-hidden backdrop-blur-sm border"
      style={{
        background: 'linear-gradient(to right, #eff6ff, #eef2ff, #faf5ff)',
        borderColor: 'rgba(96, 165, 250, 0.2)',
      }}
    >
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0" 
        style={{ background: 'linear-gradient(to right, rgba(96,165,250,0.05), rgba(99,102,241,0.05), rgba(168,85,247,0.05))' }}
      />
      <div className="relative z-10 flex items-center gap-2 mb-3">
        <div 
          className="p-1.5 rounded-lg shadow-sm"
          style={{ background: 'linear-gradient(to bottom right, #3b82f6, #4f46e5)' }}
        >
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
                className="relative flex items-start gap-2 p-3 rounded-xl border transition-all duration-300 text-left hover:shadow-lg overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderColor: 'rgba(243,244,246,0.5)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                  e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                  e.currentTarget.style.borderColor = 'rgba(243,244,246,0.5)';
                }}
              >
                <div 
                  className="relative z-10 flex-shrink-0 p-1.5 rounded-lg shadow-sm"
                  style={{ background: iconGradients[suggestion.color] || iconGradients['text-blue-600'] }}
                >
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
