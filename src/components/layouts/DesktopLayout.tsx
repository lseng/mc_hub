import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Calendar as CalendarIcon } from 'lucide-react';
import { ResourceLibrary } from '../ResourceLibrary';
import { ChatInterface } from '../ChatInterface';
import { ResourceViewer } from '../ResourceViewer';
import { Calendar } from '../Calendar';
import { Resource } from '../../types/app';
import { fallbackDates } from '../../data/importantDates';

interface DesktopLayoutProps {
  selectedResource: Resource | null;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onResourceClick: (resource: Resource) => void;
  onChatResourceClick: (resource: Resource) => void;
  onBackToResources: () => void;
  isChatExpanded: boolean;
  onToggleChat: (expanded: boolean) => void;
}

export function DesktopLayout({
  selectedResource,
  scrollContainerRef,
  onResourceClick,
  onChatResourceClick,
  onBackToResources,
  isChatExpanded,
  onToggleChat
}: DesktopLayoutProps) {
  const [activeTab, setActiveTab] = useState<'resources' | 'calendar'>('resources');
  return (
    <div className="h-dvh bg-[#ffffff] flex flex-col overflow-hidden">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 pt-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'resources' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText size={16} />
            Resources
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'calendar' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarIcon size={16} />
            Calendar
          </button>
        </div>
      </div>

      {/* Main Content Section - Reduced padding and gap */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 px-3 lg:px-6 pb-3 overflow-hidden min-h-0">
        {/* Left Panel - Content based on active tab */}
        <div 
          ref={scrollContainerRef}
          className="w-full lg:w-[480px] flex-shrink-0 px-1 overflow-y-auto overflow-x-hidden"
        >
          {activeTab === 'resources' ? (
            <ResourceLibrary 
              onResourceClick={onResourceClick} 
              selectedResourceId={selectedResource?.id || null}
            />
          ) : (
            <div className="py-4">
              <Calendar dates={fallbackDates} />
            </div>
          )}
        </div>
        
        {/* Right Panel - Chat Interface and Resource Viewer */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
          {/* Chat Interface - Always mounted, visibility controlled by CSS */}
          <div className={`absolute inset-0 ${selectedResource ? 'invisible opacity-0 pointer-events-none' : 'visible opacity-100 pointer-events-auto'} transition-all duration-200`}>
            <ChatInterface 
              key="persistent-chat" 
              onResourceClick={onChatResourceClick}
            />
          </div>
          
          {/* Resource Viewer - Only shown when resource is selected */}
          {selectedResource && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 opacity-100 pointer-events-auto"
            >
              <ResourceViewer 
                resource={selectedResource} 
                onBack={onBackToResources}
                isChatExpanded={isChatExpanded}
                onToggleChat={onToggleChat}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}