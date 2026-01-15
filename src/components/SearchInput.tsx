import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onClear?: () => void;
  suggestions?: string[];
  recentSearches?: string[];
  isLoading?: boolean;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  onClear,
  suggestions = [],
  recentSearches = [],
  isLoading = false,
  placeholder = "Search..."
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-search with debounce
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (value.trim()) {
      const timer = setTimeout(() => {
        onSearch(value);
      }, 300); // 300ms debounce
      setDebounceTimer(timer);
    } else if (onClear) {
      onClear();
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [value]); // Only depend on value

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase()) && 
    suggestion.toLowerCase() !== value.toLowerCase()
  ).slice(0, 4);

  const showRecentSearches = !value.trim() && recentSearches.length > 0;
  const showFilteredSuggestions = value.trim() && filteredSuggestions.length > 0;
  const shouldShowDropdown = isFocused && showSuggestions && (showRecentSearches || showFilteredSuggestions);

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search 
            size={18} 
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              isFocused ? 'text-[#406780]' : 'text-gray-400'
            }`} 
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`
              w-full pl-10 pr-10 py-3 border rounded-lg transition-all duration-200
              bg-white text-gray-900 placeholder-gray-500
              ${isFocused 
                ? 'border-[#406780] ring-2 ring-[#406780]/20' 
                : 'border-gray-200 hover:border-gray-300'
              }
              focus:outline-none
            `}
            style={{ fontSize: '16px' }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-[#406780] border-t-transparent rounded-full"
              />
            )}
            {value && !isLoading && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </motion.button>
            )}
          </div>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {shouldShowDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {showRecentSearches && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <Clock size={12} />
                  Recent searches
                </div>
                {recentSearches.slice(0, 3).map((search, index) => (
                  <motion.button
                    key={`recent-${index}-${search}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    {search}
                  </motion.button>
                ))}
              </div>
            )}

            {showFilteredSuggestions && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <TrendingUp size={12} />
                  Suggestions
                </div>
                {filteredSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={`suggestion-${index}-${suggestion}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    <span className="font-medium">{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}