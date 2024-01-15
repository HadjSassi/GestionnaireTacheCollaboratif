
import { JComment } from './comment';

/* eslint-disable no-shadow */
export enum IssueType {
  STORY = 'Story',
  TASK = 'Task',
  BUG = 'Bug'
}

export enum IssueStatus {
  BACKLOG = 'Backlog',
  SELECTED = 'Selected',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  IN_PROGRESS = 'InProgress',
  DONE = 'Done'
}

export const IssueStatusDisplay = {
  [IssueStatus.BACKLOG]: 'A faire',
  [IssueStatus.SELECTED]: 'En cours',
  [IssueStatus.IN_PROGRESS]: 'Echec Ou Probléme',
  [IssueStatus.DONE]: 'Fini'
};

export enum IssuePriority {
  LOWEST = 'Trés Faible',
  LOW = 'Faible',
  MEDIUM = 'Moyenne',
  HIGH = 'Haute',
  HIGHEST = 'Trés Haute'
}

export const IssuePriorityColors = {
  [IssuePriority.HIGHEST]: '#CD1317',
  [IssuePriority.HIGH]: '#E9494A',
  [IssuePriority.MEDIUM]: '#E97F33',
  [IssuePriority.LOW]: '#2D8738',
  [IssuePriority.LOWEST]: '#57A55A'
};
export interface JIssue {
  id: string;
  title: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  listPosition: number;
  description: string;
  estimate: number;
  timeSpent: number;
  timeRemaining: number;
  createdAt: string;
  updatedAt: string;//todo data de fin
  reporterId: string;
  userIds: string[];
  comments: JComment[];
  projectId: string;
}
/* eslint-enable no-shadow */
