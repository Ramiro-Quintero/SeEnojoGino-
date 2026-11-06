import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContadorResponse {
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ContadorService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/contador';

  obtener(): Observable<ContadorResponse> {
    return this.http.get<ContadorResponse>(this.apiUrl);
  }

  incrementar(): Observable<ContadorResponse> {
    return this.http.post<ContadorResponse>(`${this.apiUrl}/incrementar`, {});
  }
}
