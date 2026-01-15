import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Loader, FileText } from 'lucide-react';
import { KBResponse, ConversationItem } from '../types/knowledge-base';
import { KBSummarySection } from './KBSummarySection';
import { KBConversationHistory } from './KBConversationHistory';

interface KnowledgeBaseInterfaceProps {
  resourceId: string;
  resourceTitle: string;
  preloadedSummary?: KBResponse | null;
  isChatExpanded?: boolean;
  onToggleChat?: (expanded: boolean) => void;
}

export function KnowledgeBaseInterface({ resourceId, resourceTitle, preloadedSummary, isChatExpanded, onToggleChat }: KnowledgeBaseInterfaceProps) {
  const [summary, setSummary] = useState<KBResponse | null>(null);
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial summary when component mounts (or use preloaded)
  useEffect(() => {
    if (preloadedSummary) {
      setSummary(preloadedSummary);
      setLoadingSummary(false);
      return;
    }

    const loadSummary = async () => {
      setLoadingSummary(true);
      setError(null);
      try {
        const { makeBaseUrl, publicAnonKey } = await import('../utils/supabase/info');
        
        console.log('Loading KB summary for resource:', resourceId);
        
        const response = await fetch(`${makeBaseUrl}/kb-query`, {
          method: 'POST',
          headers: { 
            'content-type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            resource_id: resourceId,
            k: 8
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load summary: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('KB summary response:', data);
        setSummary(data);
      } catch (err) {
        console.error('Error loading KB summary:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document summary');
      } finally {
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [resourceId, preloadedSummary]);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    // Auto-expand chat when question is submitted
    if (!isChatExpanded && onToggleChat) {
      onToggleChat(true);
    }

    const currentQuestion = question.trim();
    setQuestion('');
    setIsLoading(true);
    setError(null);

    try {
      const { makeBaseUrl, publicAnonKey } = await import('../utils/supabase/info');
      
      console.log('Asking KB question:', currentQuestion, 'for resource:', resourceId);
      
      const response = await fetch(`${makeBaseUrl}/kb-query`, {
        method: 'POST',
        headers: { 
          'content-type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ 
          resource_id: resourceId,
          question: currentQuestion,
          k: 8
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get answer: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('KB question response:', data);
      
      setConversation(prev => [...prev, {
        question: currentQuestion,
        response: data,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error('Error asking KB question:', err);
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingSummary) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#406780] border-t-transparent rounded-full"
        />
        <p className="text-gray-600">Loading document analysis...</p>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
          <FileText size={24} className="text-amber-500" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Document Analysis Unavailable</h3>
          <p className="text-gray-600 max-w-md">
            {error}. This document may not have been processed for knowledge base queries yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Summary Section */}
      {summary && <KBSummarySection summary={summary} />}

      {/* Conversation History */}
      <KBConversationHistory 
        conversation={conversation} 
        error={error}
        isChatExpanded={isChatExpanded}
        onToggleChat={onToggleChat}
      />

      {/* Question Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleQuestionSubmit} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onFocus={() => {
              if (!isChatExpanded && onToggleChat) {
                onToggleChat(true);
              }
            }}
            placeholder={`Ask a question about "${resourceTitle}"...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#406780] focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            disabled={!question.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-[#406780] text-white rounded-lg hover:bg-[#355a73] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}