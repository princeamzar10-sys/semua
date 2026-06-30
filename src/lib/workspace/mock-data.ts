// Clearly-labeled placeholder data for Workspace OS surfaces (dashboard, search, context panel).
// Isolated here so swapping in real queries later only touches this file's exports, not the UI.

export interface MockPriority { id: string; label: string; done: boolean }
export interface MockMeeting { id: string; title: string; time: string; attendees: number }
export interface MockProject { id: string; name: string; progress: number; status: 'on-track' | 'at-risk' }
export interface MockTask { id: string; title: string; dueLabel: string }
export interface MockActivity { id: string; label: string; sublabel: string; emoji: string }
export interface MockSearchItem { id: string; title: string; type: 'Project' | 'Task' | 'Document' | 'Note' | 'Learning'; subtitle: string }
export interface MockDeadline { id: string; label: string; dueLabel: string }
export interface MockNote { id: string; title: string }
export interface MockFile { id: string; name: string; type: string }
export interface MockNotification { id: string; message: string; time: string }
export interface MockSuggestion { id: string; message: string }

export const MOCK_PRIORITIES: MockPriority[] = [
  { id: 'p1', label: 'Finalize Q3 roadmap deck', done: false },
  { id: 'p2', label: 'Review pull requests from the team', done: false },
  { id: 'p3', label: 'Send client follow-up email', done: true },
]

export const MOCK_MEETINGS: MockMeeting[] = [
  { id: 'm1', title: 'Product sync', time: 'Today, 2:00 PM', attendees: 5 },
  { id: 'm2', title: '1:1 with manager', time: 'Tomorrow, 10:00 AM', attendees: 2 },
  { id: 'm3', title: 'Sprint planning', time: 'Wed, 9:30 AM', attendees: 8 },
]

export const MOCK_PROJECTS: MockProject[] = [
  { id: 'pr1', name: 'Website Redesign', progress: 68, status: 'on-track' },
  { id: 'pr2', name: 'Mobile App Launch', progress: 34, status: 'at-risk' },
  { id: 'pr3', name: 'Internal Tools Migration', progress: 90, status: 'on-track' },
]

export const MOCK_TASKS: MockTask[] = [
  { id: 't1', title: 'Write release notes', dueLabel: 'Due today' },
  { id: 't2', title: 'Approve design mockups', dueLabel: 'Due tomorrow' },
  { id: 't3', title: 'Update onboarding doc', dueLabel: 'Due Friday' },
]

export const MOCK_RECENT_ACTIVITY: MockActivity[] = [
  { id: 'a1', label: 'Website Redesign', sublabel: 'Project updated', emoji: '📁' },
  { id: 'a2', label: 'Product sync', sublabel: 'Meeting notes added', emoji: '📝' },
  { id: 'a3', label: 'Release notes', sublabel: 'Task completed', emoji: '✅' },
]

export const MOCK_SEARCH_INDEX: MockSearchItem[] = [
  { id: 's1', title: 'Website Redesign', type: 'Project', subtitle: '68% complete · on track' },
  { id: 's2', title: 'Mobile App Launch', type: 'Project', subtitle: '34% complete · at risk' },
  { id: 's3', title: 'Write release notes', type: 'Task', subtitle: 'Due today' },
  { id: 's4', title: 'Approve design mockups', type: 'Task', subtitle: 'Due tomorrow' },
  { id: 's5', title: 'Q3 Roadmap.pdf', type: 'Document', subtitle: 'Updated 2 days ago' },
  { id: 's6', title: 'Client onboarding checklist', type: 'Document', subtitle: 'Updated last week' },
  { id: 's7', title: 'Sprint retro notes', type: 'Note', subtitle: 'Last edited yesterday' },
  { id: 's8', title: 'Ideas for product launch', type: 'Note', subtitle: 'Last edited 3 days ago' },
  { id: 's9', title: 'Advanced TypeScript', type: 'Learning', subtitle: '60% complete' },
  { id: 's10', title: 'Leadership Fundamentals', type: 'Learning', subtitle: 'Not started' },
]

export const MOCK_DEADLINES: MockDeadline[] = [
  { id: 'd1', label: 'Website Redesign milestone', dueLabel: 'In 2 days' },
  { id: 'd2', label: 'Q3 roadmap review', dueLabel: 'In 4 days' },
]

export const MOCK_PINNED_NOTES: MockNote[] = [
  { id: 'n1', title: 'Sprint retro notes' },
  { id: 'n2', title: 'Ideas for product launch' },
]

export const MOCK_RECENT_FILES: MockFile[] = [
  { id: 'f1', name: 'Q3 Roadmap.pdf', type: 'PDF' },
  { id: 'f2', name: 'Client onboarding checklist', type: 'Doc' },
]

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: 'no1', message: 'You were mentioned in Product sync notes', time: '1h ago' },
  { id: 'no2', message: 'Mobile App Launch is at risk', time: '3h ago' },
]

export const MOCK_AI_SUGGESTIONS: MockSuggestion[] = [
  { id: 'su1', message: 'Mobile App Launch has been at 34% for a week — consider a check-in.' },
  { id: 'su2', message: 'You have 3 meetings today with no prep notes yet.' },
]

export interface MockMilestone { id: string; label: string; dateLabel: string }
export interface MockReview { id: string; label: string; dateLabel: string }

export const MOCK_TEAM_TIMELINE: MockMilestone[] = [
  { id: 'tl1', label: 'Website Redesign — Design freeze', dateLabel: 'Fri' },
  { id: 'tl2', label: 'Mobile App Launch — Beta release', dateLabel: 'Next Mon' },
  { id: 'tl3', label: 'Internal Tools Migration — Final cutover', dateLabel: 'In 2 weeks' },
]

export const MOCK_UPCOMING_REVIEWS: MockReview[] = [
  { id: 'rv1', label: 'Q3 Self-Review', dateLabel: 'In 14 days' },
  { id: 'rv2', label: 'Peer feedback for Sarah', dateLabel: 'In 5 days' },
]
