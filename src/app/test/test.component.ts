import { Component, OnInit } from '@angular/core';
import { HTTPCommonService } from '../global-components/http-interceptor/app-http-common.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  teams$: any;
  constructor(private http: HTTPCommonService) { }

  ngOnInit(): void {
    this.teams$ = this.http.get('/api/teams');
  }

}
