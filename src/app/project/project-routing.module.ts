import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './pages/board/board.component';
import { ProjectComponent } from './project.component';
import { ProjectConst } from './config/const';
import { FullIssueDetailComponent } from './pages/full-issue-detail/full-issue-detail.component';
import { ProfilComponent } from '@trungk18/project/pages/profil/profil.component';
import { AboutComponent } from '@trungk18/project/pages/about/about.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectComponent,
    children: [
      {
        path: 'about',
        component: AboutComponent
      },
      {
        path: 'profil',
        component: ProfilComponent
      },
      {
        path: 'board',
        component: BoardComponent
      },
      {
        path: `issue/:${ProjectConst.IssueId}`,
        component: FullIssueDetailComponent
      },
      {
        path: '',
        redirectTo: 'board',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {}
