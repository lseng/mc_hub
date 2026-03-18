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
    color: "text-orange-700",
    borderColor: "border-orange-200",
    hoverBorder: "hover:border-orange-400",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
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
    color: "text-purple-700",
    borderColor: "border-purple-200",
    hoverBorder: "hover:border-purple-400",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
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
    color: "text-green-700",
    borderColor: "border-green-200",
    hoverBorder: "hover:border-green-400",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
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
    color: "text-blue-700",
    borderColor: "border-blue-200",
    hoverBorder: "hover:border-blue-400",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
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
      
      <div className="grid grid-cols-1 gap-3">
        {config.actions.map((action, index) => {
          const resource = findResource(action.key);
          const Icon = action.icon;
          
          return (
            <motion.button
              key={action.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => resource && onResourceClick(resource)}
              disabled={!resource}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all duration-200 bg-white
                ${resource 
                  ? `${config.color} ${config.borderColor} ${config.hoverBorder} cursor-pointer hover:shadow-md` 
                  : 'text-gray-400 border-gray-200 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${resource ? `${config.iconBg}` : 'bg-gray-100'}`}>
                  <Icon size={18} className={resource ? config.iconColor : 'text-gray-400'} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-base leading-tight mb-1">
                    {action.title}
                  </div>
                  <div className="text-sm opacity-75 leading-tight">
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