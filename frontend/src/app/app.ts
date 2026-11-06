import { Component, OnInit, inject, signal } from '@angular/core';
import { ContadorService } from './services/contador.service';

const CLAVE_AVISO = 'gino-aviso-inicial-oculto';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private readonly contadorService = inject(ContadorService);

  protected readonly total = signal(0);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  // Modal de aviso inicial
  protected readonly mostrarAviso = signal(false);
  protected readonly noVolverAMostrar = signal(false);

  ngOnInit(): void {
    this.cargarTotal();
    this.mostrarAviso.set(!this.avisoOculto());
  }

  protected cerrarAviso(): void {
    if (this.noVolverAMostrar()) {
      try {
        localStorage.setItem(CLAVE_AVISO, 'true');
      } catch {
        // Si el navegador bloquea localStorage, se ignora.
      }
    }
    this.mostrarAviso.set(false);
  }

  protected sumar(): void {
    if (this.cargando()) {
      return;
    }

    this.error.set(null);
    this.total.update((n) => n + 1); // se refleja al instante

    this.contadorService.incrementar().subscribe({
      next: ({ total }) => {
        // Si llegan respuestas fuera de orden, el número nunca retrocede.
        this.total.update((actual) => Math.max(actual, total));
      },
      error: () => {
        this.error.set('No se pudo guardar el enojo. Revisá la conexión.');
        this.cargarTotal();
      }
    });
  }

  private avisoOculto(): boolean {
    try {
      return localStorage.getItem(CLAVE_AVISO) === 'true';
    } catch {
      return false;
    }
  }

  private cargarTotal(): void {
    this.cargando.set(true);

    this.contadorService.obtener().subscribe({
      next: ({ total }) => {
        this.total.set(total);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con el servidor.');
        this.cargando.set(false);
      }
    });
  }
}
