import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IssueType, JIssue, IssueStatus, IssuePriority } from '@trungk18/interface/issue';
import { quillConfiguration } from '@trungk18/project/config/editor';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { IssueUtil } from '@trungk18/project/utils/issue';
import { ProjectQuery } from '@trungk18/project/state/project/project.query';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { JUser } from '@trungk18/interface/user';
import { tap } from 'rxjs/operators';
import { NoWhitespaceValidator } from '@trungk18/core/validators/no-whitespace.validator';
import { DateUtil } from '@trungk18/project/utils/date';
import { AuthService } from '@trungk18/auth/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'add-issue-modal',
  templateUrl: './add-issue-modal.component.html',
  styleUrls: ['./add-issue-modal.component.scss']
})
@UntilDestroy()
export class AddIssueModalComponent implements OnInit {
  reporterUsers$: Observable<JUser[]>;
  assignees$: Observable<JUser[]>;
  issueForm: FormGroup;
  editorOptions = quillConfiguration;
  endDate: string = this._datePipe.transform(new Date(), 'yyyy-MM-dd');
  minDate: string = this._datePipe.transform(new Date(), 'yyyy-MM-dd');
  get f() {
    return this.issueForm?.controls;
  }

  constructor(
    private _fb: FormBuilder,
    private _modalRef: NzModalRef,
    private _projectService: ProjectService,
    private _authService: AuthService,
    private _projectQuery: ProjectQuery,
    private _datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.reporterUsers$ = this._projectQuery.users$.pipe(
      untilDestroyed(this),
      tap((users) => {
        const [user] = users;
        if (user) {
          this._authService.getUser(localStorage.getItem("user")).subscribe((a:JUser)=>{
            this.f.reporterId.patchValue(a.id);
          });
        }
      })
    );
    this.assignees$ = this._projectQuery.users$;
  }

  updateEndDate(event: any) {
    this.endDate = event.target.value;
  }

  onEditorContentChange(event: any) {
    // Assuming quill editor fires 'text-change' event
    const delta = event.delta;

    // Check if the delta includes the specific formats for image or video
    const hasImage = delta.ops.some(op => op.insert && op.insert.image);
    const hasVideo = delta.ops.some(op => op.insert && op.insert.video);

    if (hasImage) {
      console.log('User inserted an image.');
      // Handle image insertion here
    }

    if (hasVideo) {
      console.log('User inserted a video.');
      // Handle video insertion here
    }
  }

  initForm() {
    this.issueForm = this._fb.group({
      type: ['Tache'],
      priority: [IssuePriority.MEDIUM],
      title: ['', NoWhitespaceValidator()],
      description: [''],
      reporterId: [''],
      userIds: [[]]
    });
  }

  submitForm() {
    if (this.issueForm.invalid) {
      return;
    }
    const now = DateUtil.getNow();
    const issue: JIssue = {
      ...this.issueForm.getRawValue(),
      id: IssueUtil.getRandomId(),
      status: IssueStatus.BACKLOG,
      createdAt: now,
      updatedAt: this.endDate
    };
    this._projectService.updateIssue(issue);
    this.closeModal();
  }

  cancel() {
    this.closeModal();
  }

  closeModal() {
    this._modalRef.close();
  }
}
