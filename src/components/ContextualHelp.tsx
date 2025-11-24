import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard,
  Users,
  Target,
  Award,
  Network,
  Briefcase,
  Settings,
  BarChart3,
  UsersRound,
  Shield,
  X,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface HelpContent {
  title: string;
  description: string;
  icon: any;
  color: string;
  tasks: {
    title: string;
    description: string;
    steps?: string[];
  }[];
  tips: string[];
}

const helpContentMap: Record<string, HelpContent> = {
  '/': {
    title: 'Dashboard',
    description: 'Your central hub for monitoring network activity and key metrics',
    icon: LayoutDashboard,
    color: 'text-blue-600',
    tasks: [
      {
        title: 'Monitor Your Network Health',
        description: 'View real-time statistics on contacts, opportunities, and referrals',
        steps: [
          'Check your Giver\'s Gain ratio',
          'Review total business generated',
          'Track active opportunities'
        ]
      },
      {
        title: 'Quick Actions',
        description: 'Use quick action buttons to add contacts, schedule meetings, or give referrals',
        steps: [
          'Click "Add Contact" to grow your network',
          'Use "Schedule Meeting" for 1-2-1s',
          'Click "Give Referral" to track business sent'
        ]
      },
      {
        title: 'View Team Performance',
        description: 'See how your team members are performing on the leaderboard'
      }
    ],
    tips: [
      'Start your day by reviewing dashboard metrics',
      'Use quick actions for common tasks',
      'Check the team leaderboard for motivation'
    ]
  },
  '/workbench': {
    title: 'My Workbench',
    description: 'Your personal workspace for managing daily networking tasks',
    icon: Briefcase,
    color: 'text-purple-600',
    tasks: [
      {
        title: 'Manage Your Pipeline',
        description: 'Track and update all your opportunities and follow-ups',
        steps: [
          'View opportunities by stage',
          'Update status as you progress',
          'Set reminders for follow-ups'
        ]
      },
      {
        title: 'Plan Your Week',
        description: 'Set and track weekly commitments',
        steps: [
          'Set targets for referrals and meetings',
          'Log completed activities',
          'Review progress at week end'
        ]
      },
      {
        title: 'Prioritize Actions',
        description: 'See what needs attention first'
      }
    ],
    tips: [
      'Review your workbench every morning',
      'Update opportunity status immediately',
      'Set realistic weekly targets'
    ]
  },
  '/contacts': {
    title: 'Contacts',
    description: 'Build and manage your professional network',
    icon: Users,
    color: 'text-green-600',
    tasks: [
      {
        title: 'Add New Contacts',
        description: 'Grow your network by adding valuable connections',
        steps: [
          'Click "Add Contact" button',
          'Fill in basic information',
          'Add their offerings and needs',
          'Tag them appropriately'
        ]
      },
      {
        title: 'Search and Filter',
        description: 'Find specific contacts quickly',
        steps: [
          'Use search bar for names or companies',
          'Apply filters for tags or attributes',
          'Sort by cooperation rating or last contact'
        ]
      },
      {
        title: 'Track Interactions',
        description: 'Log meetings, calls, and other touchpoints',
        steps: [
          'Open a contact card',
          'Click "Add Interaction"',
          'Record details and outcomes'
        ]
      }
    ],
    tips: [
      'Add contacts immediately after meeting them',
      'Record what they offer and need',
      'Log every interaction to track relationship strength',
      'Use tags to organize your network'
    ]
  },
  '/bni': {
    title: 'BNI System',
    description: 'Track BNI-specific activities and commitments',
    icon: Award,
    color: 'text-yellow-600',
    tasks: [
      {
        title: 'Give Referrals',
        description: 'Track business you send to others',
        steps: [
          'Click "Give a Referral"',
          'Select the contact receiving the referral',
          'Describe the opportunity',
          'Add estimated value',
          'Track outcome over time'
        ]
      },
      {
        title: 'Schedule GAINS Meetings',
        description: 'Plan and prepare for one-to-one meetings',
        steps: [
          'Schedule a 1-2-1 meeting',
          'Use GAINS framework for prep',
          'Record key insights after meeting',
          'Create follow-up actions'
        ]
      },
      {
        title: 'Track Weekly Commitments',
        description: 'Monitor your BNI activity targets',
        steps: [
          'Set weekly targets',
          'Log referrals given',
          'Log one-to-ones completed',
          'Track visibility days'
        ]
      }
    ],
    tips: [
      'Aim for Giver\'s Gain ratio above 1.0',
      'Schedule 2-3 one-to-ones weekly',
      'Log activities daily while fresh',
      'Use GAINS framework for deeper conversations'
    ]
  },
  '/projects': {
    title: 'Projects',
    description: 'Manage strategic initiatives and collaborations',
    icon: Target,
    color: 'text-indigo-600',
    tasks: [
      {
        title: 'Create Projects',
        description: 'Set up new initiatives or campaigns',
        steps: [
          'Click "Add Project"',
          'Define project goals and timeline',
          'Assign team members',
          'Link relevant contacts'
        ]
      },
      {
        title: 'Track Progress',
        description: 'Monitor project status and value',
        steps: [
          'Update current vs. target value',
          'Change status as needed',
          'Add progress notes',
          'Review deadlines regularly'
        ]
      },
      {
        title: 'Collaborate',
        description: 'Work with team members and contacts'
      }
    ],
    tips: [
      'Break large initiatives into projects',
      'Set realistic deadlines',
      'Review project progress weekly',
      'Link contacts who can help'
    ]
  },
  '/goals': {
    title: 'Goals',
    description: 'Set and track personal and team objectives',
    icon: Target,
    color: 'text-red-600',
    tasks: [
      {
        title: 'Create Goals',
        description: 'Define what you want to achieve',
        steps: [
          'Click "Add Goal"',
          'Choose category (Networking, Revenue, etc.)',
          'Set target date',
          'Define success criteria'
        ]
      },
      {
        title: 'Link Contacts to Goals',
        description: 'Connect people who can help achieve goals',
        steps: [
          'Open a goal',
          'Click "Link Contacts"',
          'Select relevant contacts',
          'Add relevance notes'
        ]
      },
      {
        title: 'Track Progress',
        description: 'Update completion percentage regularly',
        steps: [
          'Review goals weekly',
          'Update progress percentage',
          'Adjust target dates if needed'
        ]
      }
    ],
    tips: [
      'Set SMART goals (Specific, Measurable, Achievable)',
      'Link contacts who can help',
      'Review progress weekly',
      'Celebrate completed goals'
    ]
  },
  '/network-map': {
    title: 'Network Map',
    description: 'Visualize and analyze your network connections',
    icon: Network,
    color: 'text-cyan-600',
    tasks: [
      {
        title: 'Explore Network Graph',
        description: 'See how your contacts are connected',
        steps: [
          'Zoom and pan to explore',
          'Click nodes to see details',
          'Identify network clusters',
          'Find central connectors'
        ]
      },
      {
        title: 'Find Warm Introductions',
        description: 'Discover paths to target contacts',
        steps: [
          'Use "Find Introduction Path"',
          'Search for target contact',
          'Review suggested paths',
          'Request introduction through intermediary'
        ]
      },
      {
        title: 'Analyze Network Health',
        description: 'Review network metrics and insights',
        steps: [
          'Check network density',
          'Review community structure',
          'Identify influencers',
          'Find isolated contacts'
        ]
      }
    ],
    tips: [
      'Look for network gaps to fill',
      'Leverage strong connectors for introductions',
      'Regularly add LinkedIn connections',
      'Strengthen weak connections'
    ]
  },
  '/team': {
    title: 'Team',
    description: 'Manage and collaborate with team members',
    icon: UsersRound,
    color: 'text-pink-600',
    tasks: [
      {
        title: 'View Team Performance',
        description: 'See how team members are performing',
        steps: [
          'Review leaderboard rankings',
          'Check individual metrics',
          'Identify top performers'
        ]
      },
      {
        title: 'Assign Contacts',
        description: 'Distribute contacts among team members',
        steps: [
          'Select contacts to assign',
          'Choose team member',
          'Add assignment notes'
        ]
      },
      {
        title: 'Share Opportunities',
        description: 'Collaborate on deals and referrals'
      }
    ],
    tips: [
      'Review team performance weekly',
      'Recognize top performers',
      'Share best practices',
      'Distribute contacts strategically'
    ]
  },
  '/analytics': {
    title: 'Analytics',
    description: 'Deep dive into network and relationship metrics',
    icon: BarChart3,
    color: 'text-orange-600',
    tasks: [
      {
        title: 'Review Trends',
        description: 'Analyze performance over time',
        steps: [
          'Select time period',
          'Review key metrics',
          'Identify patterns',
          'Export reports'
        ]
      },
      {
        title: 'Network Analysis',
        description: 'Understand network dynamics',
        steps: [
          'Review connection growth',
          'Analyze engagement levels',
          'Check relationship decay alerts'
        ]
      },
      {
        title: 'ROI Tracking',
        description: 'Measure networking return on investment'
      }
    ],
    tips: [
      'Review analytics monthly',
      'Track trends over time',
      'Use insights to adjust strategy',
      'Share insights with team'
    ]
  },
  '/settings': {
    title: 'Settings',
    description: 'Configure your account and preferences',
    icon: Settings,
    color: 'text-gray-600',
    tasks: [
      {
        title: 'Profile Settings',
        description: 'Update your personal information',
        steps: [
          'Edit name and email',
          'Update profile photo',
          'Set notification preferences'
        ]
      },
      {
        title: 'Integration Setup',
        description: 'Connect external tools',
        steps: [
          'Link Microsoft 365 for calendar sync',
          'Configure BNI Connect integration',
          'Set up email tracking'
        ]
      },
      {
        title: 'System Preferences',
        description: 'Customize your experience'
      }
    ],
    tips: [
      'Keep profile information current',
      'Enable calendar sync for automation',
      'Review notification settings',
      'Set up integrations early'
    ]
  },
  '/admin': {
    title: 'Admin Panel',
    description: 'Manage system settings and users',
    icon: Shield,
    color: 'text-red-600',
    tasks: [
      {
        title: 'User Management',
        description: 'Add and manage user accounts',
        steps: [
          'Add new users',
          'Assign roles',
          'Manage permissions',
          'Deactivate users'
        ]
      },
      {
        title: 'Team Configuration',
        description: 'Set up teams and members',
        steps: [
          'Create team structure',
          'Add team members',
          'Assign roles',
          'Configure team settings'
        ]
      },
      {
        title: 'System Settings',
        description: 'Configure global system options',
        steps: [
          'Update system defaults',
          'Manage tags',
          'Configure integrations',
          'Review data management'
        ]
      }
    ],
    tips: [
      'Set up teams before adding many contacts',
      'Define clear role permissions',
      'Regular data maintenance',
      'Monitor system usage'
    ]
  }
};

interface ContextualHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContextualHelp({ open, onOpenChange }: ContextualHelpProps) {
  const location = useLocation();
  const [expandedTask, setExpandedTask] = useState<number | null>(0);

  // Get help content for current route
  const helpContent = helpContentMap[location.pathname] || helpContentMap['/'];
  const Icon = helpContent.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <Icon className={`h-6 w-6 ${helpContent.color}`} />
              </div>
              <div>
                <DialogTitle className="text-2xl">{helpContent.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {helpContent.description}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Main Tasks */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Main Tasks</h3>
              {helpContent.tasks.map((task, index) => (
                <Card key={index} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {task.description}
                        </CardDescription>
                      </div>
                      {task.steps && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedTask(expandedTask === index ? null : index)}
                        >
                          <ArrowRight className={`h-4 w-4 transition-transform ${expandedTask === index ? 'rotate-90' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {task.steps && expandedTask === index && (
                    <CardContent className="pt-0">
                      <div className="pl-4 space-y-2">
                        {task.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{step}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Quick Tips */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Quick Tips</h3>
              <Card className="border-2 bg-accent/30">
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    {helpContent.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
