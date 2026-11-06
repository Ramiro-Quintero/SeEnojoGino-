import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ContadorService } from './services/contador.service';

const CLAVE_AVISO = 'gino-aviso-inicial-oculto';
const DURACION_PRESION = 120;

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {

  private readonly contadorService = inject(ContadorService);

  protected readonly total = signal(0);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  // Modal de aviso inicial
  protected readonly mostrarAviso = signal(false);
  protected readonly noVolverAMostrar = signal(false);

  // Animación de presión en mobile
  protected readonly presionado = signal(false);
  private pressTimer: ReturnType<typeof setTimeout> | null = null;
  private pressStart = 0;

  ngOnInit(): void {
    this.cargarTotal();
    this.mostrarAviso.set(!this.avisoOculto());
  }

  ngOnDestroy(): void {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
    }
  }

  protected alPresionar(): void {
    if (this.cargando()) {
      return;
    }

    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }

    this.pressStart = Date.now();
    this.presionado.set(true);
  }

  protected alSoltar(): void {
    if (!this.presionado()) {
      return;
    }

    const transcurrido = Date.now() - this.pressStart;
    const restante = Math.max(0, DURACION_PRESION - transcurrido);

    this.pressTimer = setTimeout(() => {
      this.presionado.set(false);
      this.pressTimer = null;
    }, restante);
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
