import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { JIssue } from '@trungk18/interface/issue';
import { ProjectQuery } from '@trungk18/project/state/project/project.query';
import { NzModalService } from 'ng-zorro-antd/modal';
import { IssueDeleteModalComponent } from '../issue-delete-modal/issue-delete-modal.component';
import { DeleteIssueModel } from '@trungk18/interface/ui-model/delete-issue-model';
import { JUser } from '@trungk18/interface/user';
import { untilDestroyed } from '@ngneat/until-destroy';
import { JComment } from '@trungk18/interface/comment';
import { AuthQuery } from '@trungk18/project/auth/auth.query';
import { ProjectConst } from '@trungk18/project/config/const';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'issue-detail',
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.scss']
})
export class IssueDetailComponent implements OnInit {
  @Input() issue: JIssue;
  @Input() isShowFullScreenButton: boolean;
  @Input() isShowCloseButton: boolean;
  @Output() onClosed = new EventEmitter();
  @Output() onOpenIssue = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<DeleteIssueModel>();
  @Input() issueId2: string;

  modifiable: boolean = false;
  issue2: JIssue;
  user: JUser;
  issueId: string;
  reporterIssueId: string;
  stDate: string = this._datePipe.transform(new Date(), 'yyyy-MM-dd');
  endDate: string = this._datePipe.transform(new Date(), 'yyyy-MM-dd');
  minDate: string = this._datePipe.transform(new Date(), 'yyyy-MM-dd');

  constructor(public projectQuery: ProjectQuery,
              public projectService: ProjectService,
              private _route: ActivatedRoute,
              private _modalService: NzModalService,
              private _authQuery: AuthQuery,
              private _datePipe: DatePipe) {
  }

  ngOnInit() {
    this.issueId = this._route.snapshot.paramMap.get(ProjectConst.IssueId);
    if (this.issueId !== null) {
      this.issueId2 = this.issueId;
      this.projectService.getIssue(this.issueId).subscribe((a: JIssue) => {
        this.reporterIssueId = a.reporterId;
        this._authQuery.user$.subscribe((user) => {
          this.user = user;
          this.modifiable = this.reporterIssueId === this.user.id;
        });
      });
    }
    this.projectService.getIssue(this.issueId2).subscribe((a: JIssue) => {
      this.endDate = a.updatedAt;
      this.stDate = a.createdAt;
      if (this.issueId === null) {
        this.reporterIssueId = a.reporterId;
        this._authQuery.user$.subscribe((user) => {
          this.user = user;
          this.modifiable = this.reporterIssueId === this.user.id;
        });
      }
    });
  }


  updateEndDate(event: any) {
    this.endDate = event.target.value;
    this.issue2 = {...this.issue};
    this.issue2.updatedAt = this.endDate;
    this.projectService.updateIssue(this.issue2);
  }


  openDeleteIssueModal() {
    this._modalService.create({
      nzContent: IssueDeleteModalComponent,
      nzClosable: false,
      nzFooter: null,
      nzStyle: {
        top: '140px'
      },
      nzComponentParams: {
        issueId: this.issue.id,
        onDelete: this.onDelete
      }
    });
  }

  closeModal() {
    this.onClosed.emit();
  }

  openIssuePage() {
    this.onOpenIssue.emit(this.issue.id);
  }
}
