import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ConversationItem } from '../types/knowledge-base';

interface KBConversationHistoryProps {
  conversation: ConversationItem[];
  error: string | null;
  isChatExpanded?: boolean;
  onToggleChat?: (expanded: boolean) => void;
}

export function KBConversationHistory({ conversation, error, isChatExpanded = false, onToggleChat }: KBConversationHistoryProps) {
  const hasChatStarted = conversation.length > 0;

  return (
    <div className="relative">
      {/* Expand Button - Only show when chat is collapsed and there's history */}
      {!isChatExpanded && hasChatStarted && onToggleChat && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onToggleChat(true)}
          className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow"
        >
          <ChevronUp size={16} className="text-gray-600" />
        </motion.button>
      )}

      {/* Minimize Button - Only show when chat is expanded and has history */}
      {isChatExpanded && hasChatStarted && onToggleChat && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => onToggleChat(false)}
          className="absolute top-2 right-2 z-10 p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          title="Minimize chat"
        >
          <ChevronDown size={16} className="text-gray-600" />
        </motion.button>
      )}

      <motion.div 
        className="overflow-y-auto max-h-[50vh] flex flex-col-reverse"
        initial={false}
        animate={{
          height: (isChatExpanded && hasChatStarted) ? "50vh" : "0px",
          padding: (isChatExpanded && hasChatStarted) ? "16px" : "0px",
          opacity: (isChatExpanded && hasChatStarted) ? 1 : 0
        }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 200,
          duration: 0.3
        }}
        style={{ 
          flex: (isChatExpanded && hasChatStarted) ? "0 0 50vh" : "0 0 auto",
          height: (isChatExpanded && hasChatStarted) ? "50vh" : "0px"
        }}
      >
        <div className="flex flex-col space-y-4">
          <AnimatePresence>
            {hasChatStarted && conversation.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {/* User Question */}
                <div className="bg-[#406780] text-white p-3 rounded-lg ml-8">
                  <p className="text-sm">{item.question}</p>
                </div>
                
                {/* AI Response */}
                <div className="bg-gray-50 p-3 rounded-lg mr-8 prose prose-sm max-w-none">
                  {/* Answer or Summary */}
                  {(item.response.summary || item.response.answer) && (
                    <div className="prose prose-sm max-w-none mb-3">
                      <p className="text-gray-800 text-sm leading-relaxed mb-0">
                        {item.response.summary || item.response.answer}
                      </p>
                    </div>
                  )}

                  {/* Key Points */}
                  {item.response.key_points && item.response.key_points.length > 0 && (
                    <div className="not-prose mb-3">
                      <h5 className="font-medium text-gray-700 text-xs mb-1">Key Points</h5>
                      <ul className="list-disc ml-4 space-y-0.5">
                        {item.response.key_points.map((point, pointIndex) => (
                          <li key={pointIndex} className="text-gray-700 text-xs leading-relaxed">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sections */}
                  {item.response.sections && item.response.sections.length > 0 && (
                    <div className="not-prose mb-3">
                      <h5 className="font-medium text-gray-700 text-xs mb-1">Key Sections</h5>
                      <ul className="ml-4 space-y-0.5">
                        {item.response.sections.map((section, sectionIndex) => (
                          <li key={sectionIndex} className="text-gray-700 text-xs leading-relaxed">
                            <strong>{section.title}</strong>
                            {section.hint && <span className="text-gray-600"> — {section.hint}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  

                </div>
              </motion.div>
            ))}
            
            {/* Error Message */}
            {hasChatStarted && error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <p className="text-red-700 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}