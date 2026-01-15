import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { FilterChips } from './FilterChips';
import { SearchInput } from './SearchInput';
import { CollapsibleSection } from './CollapsibleSection';
import { CollapsibleDatesSection } from './CollapsibleDatesSection';
import { makeServerRequest } from '../utils/supabase/client';
import { DateItem } from '../types/app';
import { fallbackDates } from '../data/importantDates';
import { useIsMobile } from './ui/use-mobile';

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

interface ResourceLibraryProps {
  onResourceClick: (resource: Resource) => void;
  selectedResourceId: string | null;
  onToggleMobileChat?: () => void;
}

export function ResourceLibrary({ onResourceClick, selectedResourceId, onToggleMobileChat }: ResourceLibraryProps) {
  const isMobile = useIsMobile();
  // Core state
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [importantDates, setImportantDates] = useState<DateItem[]>(fallbackDates);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  // Filter and search state
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load all resources and calendar events once on mount
  useEffect(() => {
    const fetchAllResources = async () => {
      try {
        setLoading(true);
        const response = await makeServerRequest('/resources');
        console.log('All resources loaded:', response);

        let resources: Resource[] = [];
        if (Array.isArray(response)) {
          resources = response;
        } else if (response.resources && Array.isArray(response.resources)) {
          resources = response.resources;
        } else {
          console.warn('Unexpected response format:', response);
          resources = [];
        }

        // Debug: Log role information
        console.log('Role analysis:', {
          totalResources: resources.length,
          resourcesWithRoles: resources.filter(r => r.roles && r.roles.length > 0).length,
          uniqueRoles: [...new Set(resources.flatMap(r => r.roles || []))],
          sampleResourceRoles: resources.slice(0, 5).map(r => ({ id: r.id, title: r.title, roles: r.roles }))
        });

        setAllResources(resources);
        setIsConnected(true);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setAllResources([]);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    const fetchCalendarEvents = async () => {
      try {
        const response = await makeServerRequest('/calendar-events');
        console.log('Calendar events loaded:', response);

        if (Array.isArray(response) && response.length > 0) {
          setImportantDates(response);
        } else if (response.error) {
          console.warn('Calendar API error, using fallback dates:', response.error);
          // Keep fallback dates (already set as initial state)
        }
      } catch (err) {
        console.error('Failed to fetch calendar events, using fallback:', err);
        // Keep fallback dates (already set as initial state)
      }
    };

    fetchAllResources();
    fetchCalendarEvents();
  }, []);

  // Handle role filter changes (client-side only)
  const handleFilterChange = useCallback((filter: string) => {
    console.log('Filter changed to:', filter);
    setActiveFilter(filter);
  }, []);

  // Fast client-side search through titles and descriptions only
  const performClientSearch = useCallback((query: string) => {
    if (!query.trim()) {
      return allResources;
    }

    const searchLower = query.toLowerCase();
    return allResources.filter(resource => {
      // Search only in title and description for speed
      const titleMatch = resource.title?.toLowerCase().includes(searchLower);
      const descMatch = resource.description?.toLowerCase().includes(searchLower);
      return titleMatch || descMatch;
    });
  }, [allResources]);

  // Handle search input changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Add to search history if it's a meaningful search
    if (query.trim() && query.trim().length > 2 && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  }, [searchHistory]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Compute filtered and searched resources
  const filteredAndSearchedResources = useMemo(() => {
    // First apply search if there's a query
    let resources = searchQuery.trim() ? performClientSearch(searchQuery) : allResources;

    // Then apply role filtering
    if (activeFilter !== 'All') {
      resources = resources.filter(resource => {
        // Handle missing or invalid roles
        if (!resource.roles || !Array.isArray(resource.roles)) {
          return false;
        }

        // Case-insensitive role matching
        return resource.roles.some(role => {
          if (typeof role !== 'string') {
            return false;
          }
          return role.toLowerCase() === activeFilter.toLowerCase();
        });
      });
    }

    return resources;
  }, [allResources, activeFilter, searchQuery, performClientSearch]);

  // Group resources by section
  const resourcesBySection = useMemo(() => {
    const sections = {
      'forms': filteredAndSearchedResources.filter(r => r.section === 'forms'),
      'documents': filteredAndSearchedResources.filter(r => r.section === 'documents'),
      'media': filteredAndSearchedResources.filter(r => r.section === 'media'),
      'other': filteredAndSearchedResources.filter(r => r.section === 'other')
    };

    // Sort by position within each section
    Object.keys(sections).forEach(key => {
      sections[key as keyof typeof sections].sort((a, b) => {
        const posA = a.position || 999;
        const posB = b.position || 999;
        return posA - posB;
      });
    });

    return sections;
  }, [filteredAndSearchedResources]);

  // Search suggestions based on available resources and dates
  const searchSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    
    // Add resource words
    allResources.forEach(resource => {
      // Extract meaningful words from titles and descriptions
      const titleWords = resource.title ? resource.title.split(' ') : [];
      const descriptionWords = resource.description ? resource.description.split(' ') : [];
      const words = [...titleWords, ...descriptionWords];
      
      words.forEach(word => {
        if (word) {
          const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          if (cleanWord.length > 3 && cleanWord.length < 15) {
            suggestions.add(cleanWord);
          }
        }
      });
    });

    // Add date-specific words
    importantDates.forEach(date => {
      const titleWords = date.title ? date.title.split(' ') : [];
      const descWords = date.description ? date.description.split(' ') : [];
      const dateWords = date.date ? date.date.split(' ') : [];
      const words = [...titleWords, ...descWords, ...dateWords];
      
      words.forEach(word => {
        if (word) {
          const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          if (cleanWord.length > 3 && cleanWord.length < 15) {
            suggestions.add(cleanWord);
          }
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 8);
  }, [allResources]);

  // Filter and search dates
  const filteredAndSearchedDates = useMemo(() => {
    if (!searchQuery.trim()) {
      return importantDates;
    }

    const searchLower = searchQuery.toLowerCase();
    return importantDates.filter(date => {
      const dateMatch = date.date?.toLowerCase().includes(searchLower);
      const titleMatch = date.title?.toLowerCase().includes(searchLower);
      const descMatch = date.description?.toLowerCase().includes(searchLower);
      return dateMatch || titleMatch || descMatch;
    });
  }, [searchQuery]);

  // Get unique roles for debugging
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    allResources.forEach(resource => {
      if (resource.roles && Array.isArray(resource.roles)) {
        resource.roles.forEach(role => {
          if (typeof role === 'string') {
            roles.add(role);
          }
        });
      }
    });
    return Array.from(roles).sort();
  }, [allResources]);

  const hasResults = filteredAndSearchedResources.length > 0 || filteredAndSearchedDates.length > 0;
  const isSearchActive = searchQuery.trim().length > 0;
  const totalResourceCount = allResources.length;
  const totalResultsCount = filteredAndSearchedResources.length + filteredAndSearchedDates.length;

  // Debug log when activeFilter changes
  useEffect(() => {
    if (!loading && availableRoles.length > 0) {
      console.log('Available roles in data:', availableRoles);
      console.log('Current active filter:', activeFilter);
      console.log('Resources per role:', availableRoles.map(role => ({
        role,
        count: allResources.filter(r => r.roles?.some(rRole => rRole.toLowerCase() === role.toLowerCase())).length
      })));
    }
  }, [activeFilter, availableRoles, allResources, loading]);

  if (loading) {
    return (
      <div className="box-border content-stretch flex flex-col gap-3 h-full items-start justify-start p-0 relative shrink-0 w-full">
        <div className="font-['Inter:Extra_Bold_Italic',_sans-serif] font-extrabold italic leading-[0] relative text-[#414141] text-[24px] text-left uppercase">
          <p className="block leading-[normal]">resources</p>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center w-full h-32"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#406780] border-t-transparent rounded-full"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="box-border content-stretch flex flex-col gap-3 h-full items-start justify-start p-0 relative shrink-0 w-full">
      {/* Header Section - No animations on filter changes */}
      <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
        
        {/* Connection Status */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 w-full"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Server connection unavailable - showing {totalResourceCount} cached resources
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Chips */}
        <div className="w-full">
          <FilterChips activeFilter={activeFilter} onFilterChange={handleFilterChange} />
        </div>
        
        {/* Search Input */}
        <div className="w-full">
          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery}
            onSearch={handleSearch}
            onClear={clearSearch}
            suggestions={searchSuggestions}
            recentSearches={searchHistory}
            isLoading={false}
            placeholder="Search resources, dates, and descriptions..."
          />
        </div>

        {/* Search/Filter Status */}
        <div className="w-full text-sm text-gray-600 min-h-[20px]">
          {isSearchActive ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between"
            >
              <span>
                {hasResults ? (
                  <>Found {totalResultsCount} result{totalResultsCount !== 1 ? 's' : ''} for "{searchQuery}"</>
                ) : (
                  <>No results found for "{searchQuery}"</>
                )}
              </span>
              <button
                onClick={clearSearch}
                className="text-[#406780] hover:text-[#355a73] font-medium text-xs"
              >
                Clear
              </button>
            </motion.div>
          ) : activeFilter !== 'All' ? (
            <span>
              Showing {filteredAndSearchedResources.length} {activeFilter.toLowerCase()} resource{filteredAndSearchedResources.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span>
              {totalResourceCount} resources & {importantDates.length} important dates available
            </span>
          )}
        </div>
      </div>

      {/* Resources List - Optimized animations with proper spacing for hover effects */}
      <div className="flex flex-col gap-3 w-full overflow-y-auto overflow-x-hidden">
        {!hasResults && isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500 max-w-xs">
              {isSearchActive 
                ? 'Try adjusting your search terms or clearing the search to browse all resources.'
                : `No resources found for the "${activeFilter}" role. Try selecting a different role filter.`
              }
            </p>
            {!isSearchActive && availableRoles.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Available roles: {availableRoles.join(', ')}
              </p>
            )}
          </motion.div>
        ) : (
          <>
            <div className="space-y-3 w-full">
              {/* Important Dates Section */}
              {filteredAndSearchedDates.length > 0 && (
                <CollapsibleDatesSection
                  key="important-dates"
                  title="Important Dates"
                  dates={filteredAndSearchedDates}
                  defaultExpanded={false}
                  searchQuery={searchQuery}
                />
              )}
              
              {resourcesBySection.forms.length > 0 && (
                <CollapsibleSection
                  key="forms"
                  title="Forms"
                  resources={resourcesBySection.forms}
                  onResourceClick={onResourceClick}
                  selectedResourceId={selectedResourceId}
                  defaultExpanded={false}
                  searchQuery={searchQuery}
                />
              )}
              {resourcesBySection.documents.length > 0 && (
                <CollapsibleSection
                  key="documents"
                  title="Documents"
                  resources={resourcesBySection.documents}
                  onResourceClick={onResourceClick}
                  selectedResourceId={selectedResourceId}
                  defaultExpanded={false}
                  searchQuery={searchQuery}
                />
              )}
              {resourcesBySection.media.length > 0 && (
                <CollapsibleSection
                  key="media"
                  title="Media Resources"
                  resources={resourcesBySection.media}
                  onResourceClick={onResourceClick}
                  selectedResourceId={selectedResourceId}
                  defaultExpanded={false}
                  searchQuery={searchQuery}
                />
              )}
              {resourcesBySection.other.length > 0 && (
                <CollapsibleSection
                  key="other"
                  title="Other"
                  resources={resourcesBySection.other}
                  onResourceClick={onResourceClick}
                  selectedResourceId={selectedResourceId}
                  defaultExpanded={false}
                  searchQuery={searchQuery}
                />
              )}
            </div>
            
            {/* Mobile AI Assistant Button */}
            {isMobile && onToggleMobileChat && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleMobileChat();
                }}
                className="w-full mt-6 mb-4 p-4 bg-white text-[#406780] border-2 border-[#406780] rounded-lg flex items-center justify-center gap-3 hover:bg-[#406780] hover:text-white transition-colors"
              >
                <MessageCircle size={20} />
                <span className="font-medium">Launch AI Assistant</span>
              </motion.button>
            )}
          </>
        )}
      </div>
    </div>
  );
}