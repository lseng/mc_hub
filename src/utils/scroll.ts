export const scrollToResource = (scrollContainerRef: React.RefObject<HTMLDivElement>, resourceId: string) => {
  if (!scrollContainerRef.current) return;

  // Use a timeout to ensure the DOM has been updated
  setTimeout(() => {
    const resourceElement = scrollContainerRef.current?.querySelector(`[data-resource-id="${resourceId}"]`);
    if (resourceElement && scrollContainerRef.current) {
      // Calculate the position to scroll to (element top relative to scroll container)
      const elementRect = resourceElement.getBoundingClientRect();
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const scrollOffset = scrollContainerRef.current.scrollTop;
      
      // Calculate the target scroll position (element position minus a small offset for padding)
      const targetScrollTop = scrollOffset + (elementRect.top - containerRect.top) - 20;
      
      // Smooth scroll to the target position
      scrollContainerRef.current.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }
  }, 100);
};