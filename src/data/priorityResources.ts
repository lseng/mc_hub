// Priority resources configuration
// This file defines the default top resources for each role
// Lower numbers = higher priority (will appear first)

export interface PriorityResource {
  title: string;
  role: string;
  priority: number; // 1-3 for top priority, 4-10 for important, 11+ for normal
  reason?: string; // Why this is prioritized for this role
}

export const priorityResources: PriorityResource[] = [
  // COACH PRIORITIES
  {
    title: "Coach Application",
    role: "coach",
    priority: 1,
    reason: "Essential application form"
  },
  {
    title: "Coach Training Manual",
    role: "coach",
    priority: 2,
    reason: "Primary training resource"
  },
  {
    title: "MC Adjustment Form",
    role: "coach",
    priority: 3,
    reason: "Frequently used admin form"
  },

  // LEADER PRIORITIES  
  {
    title: "Leader Guidelines",
    role: "leader",
    priority: 1,
    reason: "Core leadership principles"
  },
  {
    title: "Event Planning Template",
    role: "leader",
    priority: 2,
    reason: "Common leadership task"
  },
  {
    title: "Group Discussion Guide",
    role: "leader",
    priority: 3,
    reason: "Weekly resource for small groups"
  },

  // APPRENTICE PRIORITIES
  {
    title: "Apprentice Handbook",
    role: "apprentice",
    priority: 1,
    reason: "Getting started guide"
  },
  {
    title: "Mentorship Pairing Form",
    role: "apprentice",
    priority: 2,
    reason: "Essential onboarding step"
  },
  {
    title: "Growth Assessment",
    role: "apprentice",
    priority: 3,
    reason: "Regular development tracking"
  },

  // MEMBER PRIORITIES
  {
    title: "MC Overview",
    role: "member",
    priority: 1,
    reason: "Introduction to MC Hub"
  },
  {
    title: "Event Calendar",
    role: "member",
    priority: 2,
    reason: "Stay updated on events"
  },
  {
    title: "Contact Directory",
    role: "member",
    priority: 3,
    reason: "Connect with leadership"
  }
];

// Helper function to get priority for a resource based on role
export function getResourcePriority(resourceTitle: string, userRole: string): number {
  const match = priorityResources.find(pr => 
    pr.title.toLowerCase().includes(resourceTitle.toLowerCase()) && 
    pr.role.toLowerCase() === userRole.toLowerCase()
  );
  
  return match ? match.priority : 999; // Default low priority if not found
}

// Get top 3 resources for a specific role
export function getTopResourcesForRole(role: string): PriorityResource[] {
  return priorityResources
    .filter(pr => pr.role.toLowerCase() === role.toLowerCase())
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
}