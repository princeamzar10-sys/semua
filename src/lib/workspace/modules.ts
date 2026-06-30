import {
  LucideIcon, FolderKanban, Users, CheckSquare, Calendar,
  StickyNote, FileStack, GraduationCap, Target, ClipboardCheck,
  Trophy, Plug, LayoutTemplate,
} from 'lucide-react'

export type SidebarGroup = 'Work' | 'Knowledge' | 'Performance' | 'Automation'

export interface PreviewStat { label: string; value: string }
export interface PreviewTable { columns: string[]; rows: string[][] }

export interface WorkspaceModule {
  id: string
  title: string
  icon: LucideIcon
  route: string
  description: string
  sidebarGroup: SidebarGroup
  /** Only 'coming-soon' exists today — typed as a union so 'beta'/'live' can be added later without a breaking change. */
  status: 'coming-soon'
  badge?: string
  /** Reserved for a future roles/permissions system — unused today. */
  permissions?: string[]
  comingSoon: true
  futureCapabilities: string[]
  useCases: string[]
  previewStats: PreviewStat[]
  previewTable: PreviewTable
}

export const WORKSPACE_MODULES: WorkspaceModule[] = [
  {
    id: 'projects',
    title: 'Projects',
    icon: FolderKanban,
    route: '/workspace/projects',
    description: 'Plan, track, and ship work across teams with boards, timelines, and milestones.',
    sidebarGroup: 'Work',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'Kanban and timeline views with drag-and-drop',
      'Milestones, dependencies, and progress rollups',
      'AI-generated project plans from a single prompt',
      'Team workload balancing across active projects',
    ],
    useCases: [
      'Track a product launch from kickoff to ship',
      'Coordinate cross-functional work across teams',
    ],
    previewStats: [
      { label: 'Active Projects', value: '3' },
      { label: 'Avg Progress', value: '68%' },
      { label: 'At Risk', value: '1' },
    ],
    previewTable: {
      columns: ['Project', 'Owner', 'Progress', 'Status'],
      rows: [
        ['Website Redesign', 'You', '68%', 'On track'],
        ['Mobile App Launch', 'You', '34%', 'At risk'],
        ['Internal Tools Migration', 'You', '90%', 'On track'],
      ],
    },
  },
  {
    id: 'meetings',
    title: 'Meetings',
    icon: Users,
    route: '/workspace/meetings',
    description: 'Schedule meetings, capture notes, and turn discussions into action items automatically.',
    sidebarGroup: 'Work',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'Google Calendar-synced meeting list',
      'AI meeting notes and automatic summaries',
      'Action item extraction assigned to the right people',
      'Searchable meeting history',
    ],
    useCases: [
      'Never lose track of what was decided in a meeting',
      'Auto-generate follow-up tasks after a call',
    ],
    previewStats: [
      { label: 'This Week', value: '5' },
      { label: 'Avg Attendees', value: '5' },
      { label: 'Notes Captured', value: '2' },
    ],
    previewTable: {
      columns: ['Meeting', 'Time', 'Attendees'],
      rows: [
        ['Product sync', 'Today, 2:00 PM', '5'],
        ['1:1 with manager', 'Tomorrow, 10:00 AM', '2'],
        ['Sprint planning', 'Wed, 9:30 AM', '8'],
      ],
    },
  },
  {
    id: 'tasks',
    title: 'Tasks',
    icon: CheckSquare,
    route: '/workspace/tasks',
    description: 'Work-specific task tracking, separate from your Personal tasks — built for team accountability.',
    sidebarGroup: 'Work',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'Assign tasks to teammates with due dates',
      'Link tasks to Projects and Meetings',
      'Status tracking across a whole team',
      'Weekly workload summaries',
    ],
    useCases: [
      'Track deliverables owed to other people',
      'See everything assigned to you across projects',
    ],
    previewStats: [
      { label: 'Open Tasks', value: '7' },
      { label: 'Due This Week', value: '3' },
      { label: 'Completed', value: '12' },
    ],
    previewTable: {
      columns: ['Task', 'Due', 'Status'],
      rows: [
        ['Write release notes', 'Today', 'In progress'],
        ['Approve design mockups', 'Tomorrow', 'Not started'],
        ['Update onboarding doc', 'Friday', 'Not started'],
      ],
    },
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: Calendar,
    route: '/workspace/calendar',
    description: 'A unified view of meetings, deadlines, and focus time — synced with Google Calendar.',
    sidebarGroup: 'Work',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'Two-way Google Calendar sync',
      'Deadline overlays from Projects and Tasks',
      'AI-suggested focus blocks',
      'Conflict detection across meetings',
    ],
    useCases: [
      'See your whole work week in one view',
      'Find the next open slot for a meeting instantly',
    ],
    previewStats: [
      { label: 'Events This Week', value: '9' },
      { label: 'Focus Blocks', value: '4' },
      { label: 'Conflicts', value: '0' },
    ],
    previewTable: {
      columns: ['Event', 'Date', 'Type'],
      rows: [
        ['Product sync', 'Today, 2:00 PM', 'Meeting'],
        ['Deep work block', 'Today, 4:00 PM', 'Focus time'],
        ['Sprint planning', 'Wed, 9:30 AM', 'Meeting'],
      ],
    },
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: StickyNote,
    route: '/workspace/notes',
    description: 'Quick notes and longer-form writing, searchable and linkable to projects and meetings.',
    sidebarGroup: 'Knowledge',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'Rich text notes with linking between pages',
      'Auto-generated notes from meetings',
      'Full-text search across your whole workspace',
      'NotebookLM-style AI summarization',
    ],
    useCases: [
      'Keep a running log of decisions on a project',
      'Draft and organize ideas before a meeting',
    ],
    previewStats: [
      { label: 'Total Notes', value: '14' },
      { label: 'Updated This Week', value: '3' },
      { label: 'Linked to Projects', value: '6' },
    ],
    previewTable: {
      columns: ['Note', 'Last Edited'],
      rows: [
        ['Sprint retro notes', 'Yesterday'],
        ['Ideas for product launch', '3 days ago'],
        ['Onboarding checklist draft', 'Last week'],
      ],
    },
  },
  {
    id: 'documents',
    title: 'Documents',
    icon: FileStack,
    route: '/workspace/documents',
    description: 'Store and organize work documents, with Google Drive sync and AI-assisted search.',
    sidebarGroup: 'Knowledge',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'Google Drive integration',
      'OCR for scanned documents',
      'AI-assisted document search and summarization',
      'Version history',
    ],
    useCases: [
      'Find a contract or spec without remembering its filename',
      'Keep all project documents in one organized place',
    ],
    previewStats: [
      { label: 'Total Documents', value: '22' },
      { label: 'Shared with Team', value: '9' },
      { label: 'Updated Today', value: '2' },
    ],
    previewTable: {
      columns: ['Document', 'Type', 'Updated'],
      rows: [
        ['Q3 Roadmap.pdf', 'PDF', '2 days ago'],
        ['Client onboarding checklist', 'Doc', 'Last week'],
        ['Brand guidelines', 'PDF', '3 weeks ago'],
      ],
    },
  },
  {
    id: 'learning',
    title: 'Learning',
    icon: GraduationCap,
    route: '/workspace/learning',
    description: 'Track courses, certifications, and skill growth tied to your career goals.',
    sidebarGroup: 'Knowledge',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'Course and certification tracking with progress bars',
      'AI-recommended learning paths based on your role',
      'Skill tagging linked to Performance reviews',
      'Reminders to keep learning streaks alive',
    ],
    useCases: [
      'Track progress through a certification program',
      'See your skill growth over the past year',
    ],
    previewStats: [
      { label: 'In Progress', value: '2' },
      { label: 'Completed', value: '5' },
      { label: 'Hours This Month', value: '8' },
    ],
    previewTable: {
      columns: ['Course', 'Progress'],
      rows: [
        ['Advanced TypeScript', '60%'],
        ['Leadership Fundamentals', '0%'],
        ['Public Speaking Basics', '100%'],
      ],
    },
  },
  {
    id: 'goals',
    title: 'Goals',
    icon: Target,
    route: '/workspace/goals',
    description: 'Work-specific OKRs and quarterly goals, separate from your Personal goals.',
    sidebarGroup: 'Performance',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'OKR-style goal trees with key results',
      'Progress rollups tied to Tasks and Projects',
      'Quarterly check-ins',
      'Manager-visible goal alignment',
    ],
    useCases: [
      'Set and track quarterly OKRs',
      'See how your daily work ladders up to team goals',
    ],
    previewStats: [
      { label: 'Active OKRs', value: '4' },
      { label: 'On Track', value: '3' },
      { label: 'At Risk', value: '1' },
    ],
    previewTable: {
      columns: ['Objective', 'Key Result', 'Progress'],
      rows: [
        ['Grow user base', 'Reach 10k signups', '72%'],
        ['Improve reliability', 'Reduce incidents by 50%', '40%'],
        ['Ship redesign', 'Launch by Q3', '68%'],
      ],
    },
  },
  {
    id: 'reviews',
    title: 'Reviews',
    icon: ClipboardCheck,
    route: '/workspace/reviews',
    description: 'Performance review cycles, self-assessments, and manager feedback in one place.',
    sidebarGroup: 'Performance',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'Structured self-review and manager-review flows',
      'AI-assisted review drafting from your activity history',
      '360-degree feedback collection',
      'Review cycle reminders',
    ],
    useCases: [
      'Prepare for a quarterly performance review',
      'Collect peer feedback ahead of a review cycle',
    ],
    previewStats: [
      { label: 'Next Review', value: '14 days' },
      { label: 'Peer Feedback', value: '3' },
      { label: 'Cycles Completed', value: '2' },
    ],
    previewTable: {
      columns: ['Cycle', 'Status', 'Due'],
      rows: [
        ['Q3 Self-Review', 'Not started', 'In 14 days'],
        ['Q2 Manager Review', 'Completed', 'Last quarter'],
      ],
    },
  },
  {
    id: 'achievements',
    title: 'Achievements',
    icon: Trophy,
    route: '/workspace/achievements',
    description: 'A record of wins, shipped work, and recognition — your career highlight reel.',
    sidebarGroup: 'Performance',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'Auto-logged achievements from completed Projects/Tasks',
      'Shareable highlight reel for reviews or resumes',
      'Peer recognition / kudos',
      'Milestone badges',
    ],
    useCases: [
      'Build your case for a promotion with real evidence',
      'Keep a running list of shipped work for your resume',
    ],
    previewStats: [
      { label: 'Shipped This Quarter', value: '12' },
      { label: 'Kudos Received', value: '6' },
      { label: 'Milestone Badges', value: '3' },
    ],
    previewTable: {
      columns: ['Achievement', 'Date'],
      rows: [
        ['Shipped Internal Tools Migration', '2 weeks ago'],
        ['Received "Above & Beyond" kudos', '1 month ago'],
        ['Hit 100% OKR completion', 'Last quarter'],
      ],
    },
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Plug,
    route: '/workspace/integrations',
    description: 'Connect Google Calendar, Drive, Gmail, and other tools your work runs on.',
    sidebarGroup: 'Automation',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'Google Calendar, Drive, and Gmail connections',
      'Slack and other workplace tool integrations',
      'Webhook-based custom integrations',
      'Per-integration permission scopes',
    ],
    useCases: [
      'Sync meetings automatically from Google Calendar',
      'Pull documents directly from Google Drive',
    ],
    previewStats: [
      { label: 'Available', value: '6' },
      { label: 'Connected', value: '0' },
      { label: 'Coming Soon', value: '6' },
    ],
    previewTable: {
      columns: ['Integration', 'Status'],
      rows: [
        ['Google Calendar', 'Coming soon'],
        ['Google Drive', 'Coming soon'],
        ['Gmail', 'Coming soon'],
        ['Slack', 'Coming soon'],
      ],
    },
  },
  {
    id: 'templates',
    title: 'Templates',
    icon: LayoutTemplate,
    route: '/workspace/templates',
    description: 'Reusable templates for projects, meetings, and documents to speed up repeat work.',
    sidebarGroup: 'Automation',
    status: 'coming-soon',
    badge: 'Soon',
    comingSoon: true,
    futureCapabilities: [
      'Project and meeting templates',
      'AI-generated templates from past work',
      'Team-shared template library',
      'One-click apply to a new module item',
    ],
    useCases: [
      'Standardize how your team kicks off a new project',
      'Reuse a meeting agenda format every week',
    ],
    previewStats: [
      { label: 'Templates', value: '8' },
      { label: 'Most Used', value: 'Sprint Kickoff' },
      { label: 'Team-Shared', value: '5' },
    ],
    previewTable: {
      columns: ['Template', 'Category', 'Uses'],
      rows: [
        ['Sprint Kickoff', 'Project', '24'],
        ['Weekly Standup Agenda', 'Meeting', '18'],
        ['Client Onboarding', 'Document', '9'],
      ],
    },
  },
]

export function getModule(id: string): WorkspaceModule | undefined {
  return WORKSPACE_MODULES.find(m => m.id === id)
}
