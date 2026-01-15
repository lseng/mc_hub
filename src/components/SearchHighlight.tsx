import { motion } from 'motion/react';

interface SearchHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
}

export function SearchHighlight({ text, searchQuery, className = '' }: SearchHighlightProps) {
  // Handle null/undefined text
  const safeText = text || '';
  
  if (!searchQuery.trim() || !safeText) {
    return <span className={className}>{safeText}</span>;
  }

  // Create regex for case-insensitive matching
  try {
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = safeText.split(regex);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          if (regex.test(part)) {
            return (
              <motion.span
                key={index}
                initial={{ backgroundColor: 'transparent' }}
                animate={{ backgroundColor: '#fef3c7' }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-yellow-200 text-yellow-900 px-0.5 rounded font-medium"
              >
                {part}
              </motion.span>
            );
          }
          return part;
        })}
      </span>
    );
  } catch (error) {
    // Fallback if regex fails
    console.error('SearchHighlight regex error:', error);
    return <span className={className}>{safeText}</span>;
  }
}