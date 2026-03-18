import { motion } from 'motion/react';
import { ClipboardList, Users, GraduationCap, Calendar, FileText, Video, ExternalLink } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  description: string;
  roles: string[];
}

interface QuickActionsProps {
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
  userRole: string;
}

const roleConfigs = {
  coach: {
    title: "Coach Quick Actions",
    color: "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 text-orange-800 border-orange-200/50",
    hoverColor: "hover:from-orange-100 hover:via-amber-100 hover:to-orange-150 hover:shadow-lg hover:shadow-orange-100/50",
    cardGradient: "bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500",
    actions: [
      { 
        key: "coach application",
        title: "Coach Application", 
        icon: ClipboardList,
        description: "Apply to become a coach"
      },
      { 
        key: "mc adjustment",
        title: "MC Adjustment Form", 
        icon: FileText,
        description: "Adjust MC information"
      },
      { 
        key: "coach check-in",
        title: "Coach Check-in Agenda", 
        icon: Calendar,
        description: "Weekly check-in template"
      },
      {
        key: "vision for coaching",
        title: "Vision for Coaching",
        icon: Video,
        description: "Understanding the coaching role"
      }
    ]
  },
  leader: {
    title: "Leader Quick Actions",
    color: "bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 text-purple-800 border-purple-200/50",
    hoverColor: "hover:from-purple-100 hover:via-violet-100 hover:to-purple-150 hover:shadow-lg hover:shadow-purple-100/50",
    cardGradient: "bg-gradient-to-br from-purple-400 via-violet-400 to-purple-500",
    actions: [
      { 
        key: "leader application",
        title: "Leader Application", 
        icon: ClipboardList,
        description: "Apply to lead an MC"
      },
      { 
        key: "weekly mc guide",
        title: "Weekly MC Guide", 
        icon: FileText,
        description: "This week's content guide"
      },
      { 
        key: "leader handbook",
        title: "MC Leader Handbook", 
        icon: FileText,
        description: "Complete leadership guide"
      },
      {
        key: "church center",
        title: "Manage Your Group",
        icon: Users,
        description: "Church Center group management"
      }
    ]
  },
  apprentice: {
    title: "Apprentice Quick Actions", 
    color: "bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 text-green-800 border-green-200/50",
    hoverColor: "hover:from-green-100 hover:via-emerald-100 hover:to-green-150 hover:shadow-lg hover:shadow-green-100/50",
    cardGradient: "bg-gradient-to-br from-green-400 via-emerald-400 to-green-500",
    actions: [
      { 
        key: "apprentice application",
        title: "Apprentice Application", 
        icon: ClipboardList,
        description: "Apply for apprenticeship"
      },
      { 
        key: "apprentice handbook",
        title: "Apprentice Handbook", 
        icon: FileText,
        description: "Getting started guide"
      },
      { 
        key: "development guide",
        title: "Development Guide", 
        icon: GraduationCap,
        description: "Track your progress"
      },
      {
        key: "mc training",
        title: "MC Training",
        icon: Video,
        description: "Training videos"
      }
    ]
  },
  member: {
    title: "Member Quick Actions",
    color: "bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 text-blue-800 border-blue-200/50", 
    hoverColor: "hover:from-blue-100 hover:via-sky-100 hover:to-blue-150 hover:shadow-lg hover:shadow-blue-100/50",
    cardGradient: "bg-gradient-to-br from-blue-400 via-sky-400 to-blue-500",
    actions: [
      { 
        key: "mc overview",
        title: "MC Overview", 
        icon: FileText,
        description: "Learn about MC Hub"
      },
      { 
        key: "weekly mc guide",
        title: "This Week's Guide", 
        icon: Calendar,
        description: "Current week content"
      },
      { 
        key: "how to tell",
        title: "Share Your Story", 
        icon: Users,
        description: "Storytelling guide"
      },
      {
        key: "church center",
        title: "Find an MC",
        icon: ExternalLink,
        description: "Join a missional community"
      }
    ]
  }
};

export function QuickActions({ resources, onResourceClick, userRole }: QuickActionsProps) {
  const config = roleConfigs[userRole.toLowerCase() as keyof typeof roleConfigs] || roleConfigs.member;
  
  const findResource = (searchKey: string) => {
    return resources.find(r => 
      r.title.toLowerCase().includes(searchKey.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchKey.toLowerCase())
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <h3 className="font-['Inter:Bold_Italic',_sans-serif] font-bold italic text-[#414141] text-lg mb-3 uppercase">
        {config.title}
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {config.actions.map((action, index) => {
          const resource = findResource(action.key);
          const Icon = action.icon;
          
          return (
            <motion.button
              key={action.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => resource && onResourceClick(resource)}
              disabled={!resource}
              className={`
                relative p-3 rounded-xl border text-left transition-all duration-300 overflow-hidden
                ${resource ? `${config.color} ${config.hoverColor} cursor-pointer shadow-sm backdrop-blur-sm` : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 cursor-not-allowed border-gray-200'}
              `}
            >
              {/* Beautiful gradient overlay for active cards */}
              {resource && (
                <div className={`absolute inset-0 opacity-0 hover:opacity-5 transition-opacity duration-300 ${config.cardGradient}`} />
              )}
              <div className="relative z-10 flex items-start gap-2">
                <div className={`flex-shrink-0 p-1.5 rounded-lg ${resource ? config.cardGradient : 'bg-gray-200'} shadow-sm`}>
                  <Icon size={14} className={`${resource ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm leading-tight mb-1">
                    {action.title}
                  </div>
                  <div className="text-xs opacity-80 leading-tight">
                    {action.description}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}