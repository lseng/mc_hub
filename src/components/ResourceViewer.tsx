import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, Download, Calendar, Tag, Users, Loader, FileText, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { KnowledgeBaseInterface } from './KnowledgeBaseInterface';
import DOMPurify from 'dompurify';

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

interface ResourceViewerProps {
  resource: Resource;
  onBack: () => void;
  isChatExpanded?: boolean;
  onToggleChat?: (expanded: boolean) => void;
}

function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getEmbedUrl(resource: Resource): string {
  const { type, url } = resource;
  
  switch (type) {
    case 'youtube':
      const youtubeId = getYouTubeId(url);
      return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : url;
    
    case 'pdf':
      return url;
    
    case 'google_doc':
      return url.includes('?') ? `${url}&embedded=true` : `${url}?embedded=true`;
    
    default:
      return url;
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

function shouldUseIframe(type: string): boolean {
  return ['youtube', 'pdf', 'google_doc'].includes(type);
}

export function ResourceViewer({ resource, onBack, isChatExpanded, onToggleChat }: ResourceViewerProps) {
  const [googleDocHtml, setGoogleDocHtml] = useState<string | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'document' | 'knowledge'>('document');
  const [hasKnowledgeBase, setHasKnowledgeBase] = useState(false);
  const [kbSummaryReady, setKbSummaryReady] = useState(false);
  const [checkingKB, setCheckingKB] = useState(true);
  const [preloadedSummary, setPreloadedSummary] = useState<any>(null);
  const [kbLoadingMessage, setKbLoadingMessage] = useState<string>('Loading...');

  const embedUrl = getEmbedUrl(resource);
  const useIframe = shouldUseIframe(resource.type) && resource.type !== 'google_doc';

  // Load KB summary with auto-ingest and polling - Only for Google Docs
  useEffect(() => {
    // Only process KB summaries for Google Docs
    if (resource.type !== 'google_doc') {
      setCheckingKB(false);
      setKbSummaryReady(false);
      setHasKnowledgeBase(false);
      setPreloadedSummary(null);
      return;
    }

    const loadKbSummary = async (resourceData: { id: string; url: string }) => {
      setCheckingKB(true);
      setKbSummaryReady(false);
      setPreloadedSummary(null);
      setKbLoadingMessage('Loading...');
      
      try {
        const { makeBaseUrl, publicAnonKey } = await import('../utils/supabase/info');
        
        console.log('Trying to load KB summary for resource:', resourceData.id);
        
        // 1) Try kb-query first
        const kbResponse = await fetch(`${makeBaseUrl}/kb-query`, {
          method: 'POST',
          headers: { 
            'content-type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            resource_id: resourceData.id,
            k: 8
          })
        });
        
        if (kbResponse.ok) {
          // ✅ Already summarized
          const data = await kbResponse.json();
          console.log('KB summary found:', data);
          const hasKB = !!(data.summary || data.answer);
          setHasKnowledgeBase(hasKB);
          setKbSummaryReady(hasKB);
          if (hasKB) {
            setPreloadedSummary(data);
          }
          return;
        }
        
        if (kbResponse.status !== 404) {
          throw new Error(`Failed to load summary: ${kbResponse.status}`);
        }
        
        // 2) Trigger ingest once
        console.log('No existing summary, triggering ingest for:', resourceData.url);
        setKbLoadingMessage('Preparing summary...');
        
        const ingestResponse = await fetch(`${makeBaseUrl}/ingest-url`, {
          method: 'POST',
          headers: { 
            'content-type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            resource_id: resourceData.id,
            url: resourceData.url,
            refresh: false
          })
        });
        
        if (!ingestResponse.ok) {
          const ingestError = await ingestResponse.text();
          throw new Error(`Ingest failed: ${ingestResponse.status} - ${ingestError}`);
        }
        
        console.log('Ingest triggered, starting polling...');
        
        // 3) Poll kb-query until ready
        const startTime = Date.now();
        const maxWaitTime = 60000; // 60 seconds
        const pollInterval = 2500; // 2.5 seconds
        
        while (Date.now() - startTime < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          
          setKbLoadingMessage('Preparing summary...');
          
          const pollResponse = await fetch(`${makeBaseUrl}/kb-query`, {
            method: 'POST',
            headers: { 
              'content-type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ 
              resource_id: resourceData.id,
              k: 8
            })
          });
          
          if (pollResponse.ok) {
            // ✅ Summary is ready!
            const data = await pollResponse.json();
            console.log('KB summary ready after polling:', data);
            const hasKB = !!(data.summary || data.answer);
            setHasKnowledgeBase(hasKB);
            setKbSummaryReady(hasKB);
            if (hasKB) {
              setPreloadedSummary(data);
            }
            return;
          }
          
          if (pollResponse.status !== 404) {
            throw new Error(`Summary fetch error: ${pollResponse.status}`);
          }
        }
        
        // Timeout
        throw new Error('Timed out preparing summary');
        
      } catch (err) {
        console.error('Error loading KB summary:', err);
        setHasKnowledgeBase(false);
        setKbSummaryReady(false);
        
        // Show appropriate error message
        if (err instanceof Error) {
          if (err.message.includes('Timed out')) {
            setKbLoadingMessage('Still working—open the original link or try again.');
          } else if (err.message.includes('Ingest failed')) {
            setKbLoadingMessage('Unable to process this document. It may be private or inaccessible.');
          } else {
            setKbLoadingMessage('Failed to load summary');
          }
        } else {
          setKbLoadingMessage('Failed to load summary');
        }
      } finally {
        setCheckingKB(false);
      }
    };

    loadKbSummary({ id: resource.id, url: resource.url });
  }, [resource.id, resource.url, resource.type]);

  // Fetch Google Doc content when it's a Google Doc
  useEffect(() => {
    if (resource.type === 'google_doc') {
      const fetchGoogleDoc = async () => {
        setIsLoadingDoc(true);
        setDocError(null);
        try {
          // Import the required values
          const { makeBaseUrl, publicAnonKey } = await import('../utils/supabase/info');
          
          console.log('Fetching Google Doc for URL:', resource.url);
          
          const res = await fetch(`${makeBaseUrl}/render-doc`, {
            method: 'POST',
            headers: { 
              'content-type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ url: resource.url })
          });
          
          const responseData = await res.json();
          console.log('Google Doc proxy response:', responseData);
          
          if (!res.ok) {
            // Handle specific error types with user-friendly messages
            let errorMessage = 'Failed to load document';
            
            if (responseData.error === 'not_google_docs_url') {
              errorMessage = 'This resource is not a valid Google Docs URL. The document may be stored locally or in a different system.';
            } else if (responseData.error === 'invalid_google_docs_url') {
              errorMessage = 'Unable to access this Google Docs document. It may be private or the URL format is not supported.';
            } else if (responseData.error === 'fetch_failed') {
              errorMessage = 'The Google Docs document could not be accessed. It may be private or deleted.';
            } else if (responseData.message) {
              errorMessage = responseData.message;
            }
            
            throw new Error(errorMessage);
          }
          
          if (responseData.html) {
            setGoogleDocHtml(responseData.html);
          } else {
            throw new Error('No document content received');
          }
        } catch (error) {
          console.error('Error fetching Google Doc:', error);
          setDocError(error instanceof Error ? error.message : 'Failed to load document');
        } finally {
          setIsLoadingDoc(false);
        }
      };

      fetchGoogleDoc();
    }
  }, [resource.type, resource.url]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </motion.button>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{resource.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
          </div>
          
          <Button
            asChild
            size="sm"
            className="bg-[#406780] hover:bg-[#365a75] text-white"
          >
            <motion.a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <ExternalLink size={16} />
              View Resource
            </motion.a>
          </Button>
        </div>
        
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
          {resource.date_added && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(resource.date_added)}</span>
            </div>
          )}
          
          {resource.roles.length > 0 && (
            <div className="flex items-center gap-2">
              <Users size={14} />
              <div className="flex gap-1">
                {resource.roles.map(role => (
                  <span key={role} className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {resource.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag size={14} />
              <div className="flex gap-1">
                {resource.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 3 && (
                  <span className="text-gray-400 text-xs">+{resource.tags.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs for Knowledge Base vs Document View - Only for Google Docs */}
        {resource.type === 'google_doc' && (checkingKB || hasKnowledgeBase) && (
          <div className="flex gap-1 mt-4">
            <motion.button
              onClick={() => setActiveTab('document')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'document'
                  ? 'bg-gray-100 text-[#406780] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <FileText size={14} />
              Document
            </motion.button>
            <motion.button
              onClick={() => kbSummaryReady && setActiveTab('knowledge')}
              whileHover={kbSummaryReady ? { scale: 1.02 } : {}}
              whileTap={kbSummaryReady ? { scale: 0.98 } : {}}
              disabled={!kbSummaryReady}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'knowledge'
                  ? 'bg-gray-100 text-[#406780] shadow-sm'
                  : kbSummaryReady 
                    ? 'text-gray-600 hover:text-gray-800 cursor-pointer hover:bg-gray-50'
                    : checkingKB
                      ? 'text-gray-600 cursor-not-allowed bg-gray-50'
                      : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <Sparkles size={14} />
              AI Summary
              {checkingKB && (
                <Loader size={14} className="animate-spin ml-1" />
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {hasKnowledgeBase && activeTab === 'knowledge' ? (
          <KnowledgeBaseInterface 
            resourceId={resource.id}
            resourceTitle={resource.title}
            preloadedSummary={preloadedSummary}
            isChatExpanded={isChatExpanded}
            onToggleChat={onToggleChat}
          />
        ) : resource.type === 'google_doc' ? (
          // Special handling for Google Docs
          <div className="h-full overflow-y-auto">
            {isLoadingDoc ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-[#406780] border-t-transparent rounded-full"
                />
                <p className="text-gray-600">Loading document...</p>
              </div>
            ) : docError ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                  <ExternalLink size={24} className="text-amber-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900">Document Not Available</h3>
                  <p className="text-gray-600 max-w-md leading-relaxed">
                    {docError}
                  </p>
                  
                  {/* Show the URL/resource info */}
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-left">
                    <div className="font-medium text-gray-700 mb-1">Resource Information:</div>
                    <div className="text-gray-600">
                      <div><strong>Title:</strong> {resource.title}</div>
                      <div><strong>URL/Reference:</strong> {resource.url}</div>
                      {resource.description && (
                        <div><strong>Description:</strong> {resource.description}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Only show "Open in Google Docs" button if URL looks like a Google Docs URL */}
                {(resource.url.includes('docs.google.com') || resource.url.includes('drive.google.com')) && (
                  <motion.a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#406780] text-white rounded-lg hover:bg-[#355a73] transition-colors"
                  >
                    <ExternalLink size={18} />
                    Try Opening in Google Docs
                  </motion.a>
                )}
              </div>
            ) : googleDocHtml ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="h-full overflow-y-auto p-6 bg-white"
              >
                <article className="prose">
                  <div
                    // render the sanitized HTML we got from /render-doc
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(googleDocHtml, { USE_PROFILES: { html: true } }),
                    }}
                  />
                </article>
              </motion.div>
            ) : null}
          </div>
        ) : useIframe ? (
          <motion.iframe
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            src={embedUrl}
            className="w-full h-full border-0"
            title={resource.title}
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : resource.type === 'rss' ? (
          // RSS feeds - show directly without external resource warning
          <div className="h-full p-4">
            <motion.iframe
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              src={embedUrl}
              className="w-full h-full border border-gray-200 rounded-lg"
              title={resource.title}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <ExternalLink size={24} className="text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">External Resource</h3>
              <p className="text-gray-600 max-w-md">
                This resource opens in an external window. Click the button below to access it.
              </p>
            </div>
            
            <motion.a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#406780] text-white rounded-lg hover:bg-[#355a73] transition-colors"
            >
              <ExternalLink size={18} />
              Open Resource
            </motion.a>

            {/* Fallback iframe for other types */}
            {resource.type !== 'church_center_form' && (
              <div className="w-full border-t border-gray-200 pt-6 mt-6">
                <p className="text-sm text-gray-500 mb-3">Preview (may not work for all resources):</p>
                <motion.iframe
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  src={embedUrl}
                  className="w-full h-96 border border-gray-200 rounded-lg"
                  title={`${resource.title} - Preview`}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}