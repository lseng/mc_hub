import { motion } from 'motion/react';
import { ResourceLibrary } from '../ResourceLibrary';
import { ChatInterface } from '../ChatInterface';
import { ResourceViewer } from '../ResourceViewer';
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
  return (
    <div className="h-dvh bg-[#ffffff] flex flex-col overflow-hidden">
      {/* Main Content Section - Reduced padding and gap */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 px-3 lg:px-6 pb-3 overflow-hidden min-h-0">
        {/* Left Panel - Resource Library with proper padding for card margins */}
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