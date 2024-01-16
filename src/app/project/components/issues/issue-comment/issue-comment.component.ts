import { Component, Input, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { JComment } from '@trungk18/interface/comment';
import { JUser } from '@trungk18/interface/user';
import { AuthQuery } from '@trungk18/project/auth/auth.query';
import { ProjectService } from '@trungk18/project/state/project/project.service';

@Component({
  selector: 'issue-comment',
  templateUrl: './issue-comment.component.html',
  styleUrls: ['./issue-comment.component.scss']
})
@UntilDestroy()
export class IssueCommentComponent implements OnInit {
  @Input() issueId: string;
  @Input() comment: JComment;
  @Input() createMode: boolean;
  @ViewChild('commentBoxRef') commentBoxRef: ElementRef;
  commentControl: FormControl;
  user: JUser;
  isEditing: boolean;
  isEditingComment: boolean = false;
  commentBody : string = "";
  isModified: boolean = false;
  modifiable: boolean = false;
  constructor(
    private _authQuery: AuthQuery,
    private projectService: ProjectService
  ) {}

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (!this.createMode || this.isEditing) {
      return;
    }
    if (event.key === 'M') {
      this.commentBoxRef.nativeElement.focus();
      this.isEditing = true;
    }
  }

  ngOnInit(): void {
    this.commentControl = new FormControl('');
    this._authQuery.user$.pipe(untilDestroyed(this)).subscribe((user) => {
      this.user = user;
      if (this.createMode) {
        this.comment = new JComment(this.issueId, this.user);
      }
      this.commentBody = this.comment.body;
      this.isModified = this.comment.updatedAt != this.comment.createdAt;
      this.modifiable = this.comment.user.id === this.user.id;
    });
  }

  setCommentEdit(mode: boolean) {
    this.isEditing = mode;
  }

  addComment() {
    const now = new Date();
    this.projectService.updateIssueComment(this.issueId, {
      ...this.comment,
      id: `${now.getTime()}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      body: this.commentControl.value
    });
    this.cancelAddComment();
  }

  cancelAddComment() {
    this.commentControl.patchValue('');
    this.setCommentEdit(false);
  }

  modifyComment() {
    this.isEditingComment = !this.isEditingComment;
  }

  deleteComment() {
    this.projectService.deleteComment(this.comment.issueId,this.comment.id);
  }

  saveModifyComment(mess) {
    const now = new Date();
    let updatedComment:JComment = {...this.comment};
    updatedComment.body = mess;
    updatedComment.updatedAt = now.toISOString();
    this.projectService.updateIssueComment(this.comment.issueId, updatedComment);
    this.modifyComment();
  }
}
