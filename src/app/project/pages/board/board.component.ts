import { Component } from '@angular/core';
import { GoogleAnalyticsService } from '@trungk18/core/services/google-analytics.service';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  breadcrumbs: string[] = ['Atelier Développement', 'Mini Projet', 'Gestionnaire de tâche collaboratif'];

  constructor() {}

}
