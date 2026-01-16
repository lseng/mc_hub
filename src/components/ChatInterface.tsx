import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, ExternalLink } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: 'webpage' | 'youtube' | 'pdf' | 'google_doc' | 'church_center_form' | 'rss' | 'audio' | 'image' | 'other';
  url: string;
  description: string;
  date_added: string;
  roles: string[];
  tags: string[];
  section: 'forms' | 'documents' | 'media' | 'other';
  thumbnail_url?: string;
  position?: number;
}

interface ChatInterfaceProps {
  onResourceClick: (resource: Resource) => void;
}

const examplePrompts = [
  "How do I become an MC coach?",
  "What resources are available for leaders?", 
  "Show me the latest forms for apprentices",
  "Help me find training materials"
];

function ChatRow({ row, onOpen }: { row: any; onOpen: (r: any) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${row.from === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {row.from === 'ai' && (
        <div className="w-8 h-8 bg-[#406780] rounded-full flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${row.from === 'user' ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-lg ${
            row.from === 'user'
              ? 'bg-[#406780] text-white ml-auto'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Chat text content - prioritize answer field, then fallback to text */}
          {(row.answer || row.text) && (
            <div className="chat-text text-base leading-relaxed whitespace-pre-wrap mb-2">
              {row.answer || row.text}
            </div>
          )}

          {/* Resource cards within the chat bubble */}
          {row.resources?.length > 0 && (
            <div className="chat-resources space-y-2 mt-2">
              {row.resources.map((r: any) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="resource-card bg-white border border-gray-200 rounded-lg p-3 hover:border-[#406780] hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => onOpen(r)}
                >
                  <div className="flex items-start gap-2">
                    <ExternalLink size={14} className="text-[#406780] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="resource-type text-xs uppercase px-2 py-1 border border-gray-300 rounded text-gray-600 inline-block mb-2">
                        {r.type.replace('_', ' ')}
                      </div>
                      <h4 className="font-medium text-gray-900 text-base mb-1 leading-tight">
                        {r.title}
                      </h4>
                      {r.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {row.from === 'user' && (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-gray-600" />
        </div>
      )}
    </motion.div>
  );
}

export function ChatInterface({ onResourceClick }: ChatInterfaceProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string>('');
  const [currentRole] = useState('Member'); // Default role - could be made configurable
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (msg: string) => {
    if (!msg.trim() || isLoading) return;

    // Add user message
    setRows(prev => [...prev, { from: 'user', text: msg.trim() }]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Import the required values
      const { makeBaseUrl, publicAnonKey } = await import('../utils/supabase/info');
      
      const url = `${makeBaseUrl}/api/chat`;
      
      const r = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ 
          q: msg.trim(),
          role: currentRole.toLowerCase() // Pass user role to backend
        })
      });

      if (r.status === 429) {
        const { retry_ms } = await r.json().catch(() => ({}));
        const retrySeconds = Math.ceil((retry_ms || 30000) / 1000);
        
        setRateLimitMessage(`Model busy. Retry in ${retrySeconds} seconds...`);
        
        // Countdown timer
        let countdown = retrySeconds;
        const countdownInterval = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            setRateLimitMessage(`Model busy. Retry in ${countdown} seconds...`);
          } else {
            clearInterval(countdownInterval);
            setRateLimitMessage('');
            // Auto-retry the message
            setTimeout(() => {
              sendMessage(msg);
            }, 100);
          }
        }, 1000);
        
        setIsLoading(false);
        return;
      }

      const j = await r.json();
      console.log('Chat response:', j);

      // Create unified AI response message with proper answer handling
      const aiMessage: any = {
        from: "ai",
        id: Date.now().toString(), // Add unique ID for tracking
        // Try to get answer from various possible fields in the response
        answer: j.answer || j.text || j.message || 'I received your message but there was no response content.',
      };

      // Add resources if they exist
      if (Array.isArray(j.resources) && j.resources.length) {
        aiMessage.resources = j.resources;
      }

      setRows(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      setRows(prev => [...prev, { 
        from: "ai", 
        answer: 'I apologize, but I\'m having trouble connecting to the server right now. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#406780] rounded-full flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">MC Hub Assistant</h3>
            <p className="text-sm text-gray-500">Ask questions about MC resources and guidance</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {rows.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="space-y-2">
                <h4 className="text-lg font-medium text-gray-900">Welcome to MC Hub</h4>
                <p className="text-gray-600 text-base">
                  I can help you find resources, answer questions about MC programs, and guide you through forms and documentation.
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Try asking:</p>
                <div className="grid gap-1.5">
                  {examplePrompts.map((prompt, index) => (
                    <motion.button
                      key={prompt}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleExampleClick(prompt)}
                      className="text-left p-2 rounded-lg border border-gray-200 hover:border-[#406780] hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm text-gray-700">{prompt}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            rows.map((row, index) => (
              <ChatRow key={index} row={row} onOpen={onResourceClick} />
            ))
          )}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 bg-[#406780] rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        {rateLimitMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg">
              <p className="text-base text-amber-800">{rateLimitMessage}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about MC resources, forms, or guidance..."
              disabled={isLoading || !!rateLimitMessage}
              className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#406780] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base"
              style={{ fontSize: '16px' }}
            />
            <motion.button
              type="submit"
              disabled={!inputValue.trim() || isLoading || !!rateLimitMessage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-[#406780] text-white rounded-md hover:bg-[#355a73] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}