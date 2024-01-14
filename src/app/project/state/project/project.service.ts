import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { arrayRemove, arrayUpsert, setLoading } from '@datorama/akita';
import { JComment } from '@trungk18/interface/comment';
import { JIssue } from '@trungk18/interface/issue';
import { JProject } from '@trungk18/interface/project';
import { DateUtil } from '@trungk18/project/utils/date';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProjectStore } from './project.store';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  baseUrl: string;

  constructor(private _http: HttpClient, private _store: ProjectStore) {
    this.baseUrl = environment.apiUrl;
  }

  setLoading(isLoading: boolean) {
    this._store.setLoading(isLoading);
  }

  getProject() {
    this._http
      .get<JProject>(`${this.baseUrl}/data/all`)
      .pipe(
        setLoading(this._store),
        tap((project) => {
          this._store.update((state) => ({
            ...state,
            ...project
          }));
        }),
        catchError((error) => {
          this._store.setError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  updateProject(project: Partial<JProject>) {
    this._store.update((state) => ({
      ...state,
      ...project
    }));
  }

/*  updateIssue(issue: JIssue) {
    issue.updatedAt = DateUtil.getNow();
    this._store.update((state) => {
      const issues = arrayUpsert(state.issues, issue.id, issue);
      return {
        ...state,
        issues
      };
    });
  }*/
  updateIssue(issue: JIssue) {
    this._http.put(`${this.baseUrl}/data/update/issue`, issue).subscribe(
      () => {
        this.getProject();
        console.log('Issue updated successfully');
      },
      (error) => {
        this.getProject();
        this._store.setError(error);
        console.log('Error updating issue');
      }
    );
  }

  deleteIssue(issueId: string) {
    this._http.delete(`${this.baseUrl}/data/delete/${issueId}`).subscribe(
      () => {
        this._store.update((state) => {
          const issues = arrayRemove(state.issues, issueId);
          this.getProject();
          console.log('Issue deleted successfully');
          return {
            ...state,
            issues
          };
        });
      },
      (error) => {
        this.getProject();
        this._store.setError(error);
        console.log('Error deleting issue');
      }
    );
  }

/*
  updateIssueComment(issueId: string, comment: JComment) {
    const allIssues = this._store.getValue().issues;
    const issue = allIssues.find((x) => x.id === issueId);
    if (!issue) {
      return;
    }

    const comments = arrayUpsert(issue.comments ?? [], comment.id, comment);
    this.updateIssue({
      ...issue,
      comments
    });
  }
*/

  updateIssueComment(issueId: string, comment: JComment) {
    const data = { issueId, comment };
    this._http.put(`${this.baseUrl}/data/update/issue/comment`, data).subscribe(
      () => {
        this.getProject();
        console.log('Issue comment updated successfully');
      },
      (error) => {
        this.getProject();
        this._store.setError(error);
        console.log('Error updating issue comment');
      }
    );
  }

  modifyComment(issueId: string, comment: JComment){

  }

  deleteComment(issueId: string, commentId: string){
    this._http.delete(`${this.baseUrl}/data/delete/${issueId}/${commentId}`).subscribe(
      () => {
        this._store.update((state) => {
          this.getProject();
          console.log('Comment deleted successfully');
        });
      },
      (error) => {
        this.getProject();
        this._store.setError(error);
        console.log('Error deleting issue');
      }
    );
  }

}
