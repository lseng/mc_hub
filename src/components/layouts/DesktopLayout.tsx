import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Calendar as CalendarIcon } from 'lucide-react';
import { ResourceLibrary } from '../ResourceLibrary';
import { ChatInterface } from '../ChatInterface';
import { ResourceViewer } from '../ResourceViewer';
import { CalendarPage } from './CalendarPage';
import { Resource } from '../../types/app';

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
      <div className="bg-white px-6 pt-6 pb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
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

      {/* Main Content Section */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 px-3 lg:px-6 pb-3 overflow-hidden min-h-0">
        {activeTab === 'resources' ? (
          <>
            {/* Left Panel - Resource Library */}
            <div 
              ref={scrollContainerRef}
              className="w-full lg:w-[480px] flex-shrink-0 px-1 overflow-y-auto overflow-x-hidden"
            >
              <ResourceLibrary 
                onResourceClick={onResourceClick} 
                selectedResourceId={selectedResource?.id || null}
              />
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
              
              {/* Resource Viewer - Only visible when resource is selected */}
              {selectedResource && (
                <div className="absolute inset-0 visible opacity-100 pointer-events-auto transition-all duration-200">
                  <ResourceViewer 
                    resource={selectedResource}
                    onBack={onBackToResources}
                    onChatResourceClick={onChatResourceClick}
                    isChatExpanded={isChatExpanded}
                    onToggleChat={onToggleChat}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          /* Full-width Calendar */
          <div className="flex-1 min-w-0 overflow-hidden">
            <CalendarPage />
          </div>
        )}
      </div>
    </div>
  );
}