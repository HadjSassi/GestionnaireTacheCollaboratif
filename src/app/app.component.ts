import { Component, ViewEncapsulation, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { ProjectQuery } from './project/state/project/project.query';
import { ProjectService } from './project/state/project/project.service';
import { GoogleAnalyticsService } from './core/services/google-analytics.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit, OnInit {
  isNotAuthRoute: boolean = false;
  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public projectQuery: ProjectQuery,
    private _cdr: ChangeDetectorRef,
    private _projectService: ProjectService,
    private _googleAnalytics: GoogleAnalyticsService
  ) {
    this._projectService.setLoading(true);

    if (environment.production) {
      this.router.events.subscribe(this.handleGoogleAnalytics);
    }
  }
  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Check if the current route is not 'auth'
        this.isNotAuthRoute = !this.activatedRoute.snapshot.firstChild?.routeConfig?.path.includes('auth');
      });
  }
  handleGoogleAnalytics = (event: any): void => {
    if (event instanceof NavigationEnd) {
      this._googleAnalytics.sendPageView(event.urlAfterRedirects);
    }
  };
  isAuthRoute: boolean;

  ngAfterViewInit() {
    this._cdr.detectChanges();
  }
}
