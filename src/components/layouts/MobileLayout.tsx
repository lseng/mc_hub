import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { ResourceLibrary } from '../ResourceLibrary';
import { ChatInterface } from '../ChatInterface';
import { ResourceViewer } from '../ResourceViewer';
import { Resource, MobileView } from '../../types/app';

interface MobileLayoutProps {
  selectedResource: Resource | null;
  mobileView: MobileView;
  showMobileChat: boolean;
  onResourceClick: (resource: Resource) => void;
  onChatResourceClick: (resource: Resource) => void;
  onBackToResources: () => void;
  onToggleMobileChat: () => void;
  isChatExpanded: boolean;
  onToggleChat: (expanded: boolean) => void;
}

export function MobileLayout({
  selectedResource,
  mobileView,
  showMobileChat,
  onResourceClick,
  onChatResourceClick,
  onBackToResources,
  onToggleMobileChat,
  isChatExpanded,
  onToggleChat
}: MobileLayoutProps) {
  return (
    <div className="h-dvh bg-[#ffffff] flex flex-col overflow-hidden relative">
      {/* Main Content Section */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {mobileView === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 px-3 pb-20 overflow-y-auto overflow-x-hidden"
            >
              <div className="px-1">
                <ResourceLibrary 
                  onResourceClick={onResourceClick} 
                  selectedResourceId={selectedResource?.id || null}
                  onToggleMobileChat={onToggleMobileChat}
                />
              </div>
            </motion.div>
          )}
          
          {mobileView === 'resource-detail' && selectedResource && (
            <motion.div
              key="resource-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ResourceViewer 
                resource={selectedResource} 
                onBack={onBackToResources}
                isChatExpanded={isChatExpanded}
                onToggleChat={onToggleChat}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>



      {/* Chat Overlay */}
      <AnimatePresence>
        {showMobileChat && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onToggleMobileChat()}
              className="fixed inset-0 bg-black/20 z-30"
            />
            
            {/* Chat Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 h-[80vh] bg-white rounded-t-xl shadow-2xl z-40 flex flex-col overflow-hidden touch-pan-y"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => onToggleMobileChat()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-white/90 backdrop-blur-sm"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              
              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <ChatInterface key="persistent-chat" onResourceClick={onChatResourceClick} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}