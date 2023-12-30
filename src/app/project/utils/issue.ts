import { IssuePriority, IssueType } from '@trungk18/interface/issue';
import { IssuePriorityIcon } from '@trungk18/interface/issue-priority-icon';

export class IssueUtil {
  static getIssueTypeIcon(issueType: IssueType): string {
    return issueType?.toLowerCase();
  }
  static getIssueTypeValue(issueType: IssueType): string {
    switch (issueType) {
      case IssueType.STORY:
        return 'Mission';
      case IssueType.TASK:
        return 'Tache';
      case IssueType.BUG:
        return 'Error';
      default:
        return 'Travail';
    }
  }

  static getIssueIconByValue(issueType: string): string {
    switch (issueType) {
      case 'Mission':
        return IssueType.STORY.toLowerCase();
      case 'Tache':
        return IssueType.TASK.toLowerCase();
      case 'Error':
        return IssueType.BUG.toLowerCase();
      default:
        return IssueType.TASK.toLowerCase();
    }
  }
  static getIssuePriorityIcon(issuePriority: IssuePriority): IssuePriorityIcon {
    return new IssuePriorityIcon(issuePriority);
  }

  static getRandomId(): string {
    return `${Math.ceil(Math.random() * 8000)}`;
  }

  static searchString(str: string, searchString: string): boolean {
    str = str ?? '';
    searchString = searchString ?? '';
    return str.trim().toLowerCase().includes(searchString.trim().toLowerCase());
  }
}
