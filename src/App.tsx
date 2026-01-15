import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from './components/ui/use-mobile';
import { DesktopLayout } from './components/layouts/DesktopLayout';
import { MobileLayout } from './components/layouts/MobileLayout';
import { scrollToResource } from './utils/scroll';
import { Resource, MobileView } from './types/app';

export default function App() {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('resources');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    if (isMobile) {
      setMobileView('resource-detail');
      setShowMobileChat(false);
    } else {
      scrollToResource(scrollContainerRef, resource.id);
    }
  };

  const handleBackToResources = () => {
    if (isMobile) {
      setMobileView('resources');
      setSelectedResource(null);
    } else {
      setSelectedResource(null);
    }
  };

  const handleChatResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    if (isMobile) {
      setMobileView('resource-detail');
      setShowMobileChat(false);
    } else {
      scrollToResource(scrollContainerRef, resource.id);
    }
  };

  const handleToggleMobileChat = () => {
    // Prevent any scroll behavior when toggling chat
    if (document.body.style.overflow !== 'hidden') {
      // When opening chat, prevent background scroll
      if (!showMobileChat) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // When closing chat, restore scroll
      if (showMobileChat) {
        document.body.style.overflow = '';
      }
    }
    
    setShowMobileChat(!showMobileChat);
  };

  // Auto-scroll when selectedResource changes (for desktop)
  useEffect(() => {
    if (selectedResource && !isMobile) {
      scrollToResource(scrollContainerRef, selectedResource.id);
    }
  }, [selectedResource, isMobile]);

  // Cleanup body overflow when chat state changes or component unmounts
  useEffect(() => {
    return () => {
      // Restore scroll when component unmounts
      document.body.style.overflow = '';
    };
  }, []);

  // Reset body overflow when mobile chat is closed
  useEffect(() => {
    if (!showMobileChat) {
      document.body.style.overflow = '';
    }
  }, [showMobileChat]);

  // Desktop Layout
  if (!isMobile) {
    return (
      <DesktopLayout
        selectedResource={selectedResource}
        scrollContainerRef={scrollContainerRef}
        onResourceClick={handleResourceClick}
        onChatResourceClick={handleChatResourceClick}
        onBackToResources={handleBackToResources}
        isChatExpanded={isChatExpanded}
        onToggleChat={setIsChatExpanded}
      />
    );
  }

  // Mobile Layout
  return (
    <MobileLayout
      selectedResource={selectedResource}
      mobileView={mobileView}
      showMobileChat={showMobileChat}
      onResourceClick={handleResourceClick}
      onChatResourceClick={handleChatResourceClick}
      onBackToResources={handleBackToResources}
      onToggleMobileChat={handleToggleMobileChat}
      isChatExpanded={isChatExpanded}
      onToggleChat={setIsChatExpanded}
    />
  );
}