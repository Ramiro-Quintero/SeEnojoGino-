import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import {
  Observable,
  Subscription,
  catchError,
  finalize,
  interval,
  switchMap,
  throwError,
  timeout,
  timer
} from 'rxjs';
import { ContadorResponse, ContadorService } from './services/contador.service';

const CLAVE_AVISO = 'gino-aviso-inicial-oculto';
const DURACION_PRESION = 120;
const TIEMPO_MAXIMO_RECONEXION = 180_000;
const TIMEOUT_PETICION = 15_000;
const ESPERA_ENTRE_INTENTOS = 4_000;
const SEGUNDOS_CONECTANDO = 5;
const SEGUNDOS_DESPERTANDO = 15;

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

  // Mensajes de espera (Render free tarda hasta ~2 minutos en despertar)
  protected readonly segundosEsperando = signal(0);
  protected readonly mensajeCarga = computed(() => {
    const segundos = this.segundosEsperando();
    if (segundos < SEGUNDOS_CONECTANDO) {
      return 'Cargando...';
    }
    if (segundos < SEGUNDOS_DESPERTANDO) {
      return 'Conectando con el servidor...';
    }
    return `Despertando el servidor... ${segundos}s`;
  });
  protected readonly mostrarAyudaCarga = computed(
    () => this.segundosEsperando() >= SEGUNDOS_DESPERTANDO
  );

  // Modal de aviso inicial
  protected readonly mostrarAviso = signal(false);
  protected readonly noVolverAMostrar = signal(false);

  // Animación de presión en mobile
  protected readonly presionado = signal(false);
  private pressTimer: ReturnType<typeof setTimeout> | null = null;
  private pressStart = 0;

  private cargandoTotal = false;
  private temporizadorEspera: Subscription | null = null;

  ngOnInit(): void {
    this.cargarTotal();
    this.mostrarAviso.set(!this.avisoOculto());
  }

  ngOnDestroy(): void {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
    }
    if (this.temporizadorEspera) {
      this.temporizadorEspera.unsubscribe();
      this.temporizadorEspera = null;
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

  protected reintentar(): void {
    this.error.set(null);
    this.cargarTotal();
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
        // No se reintenta el POST para no sumar dos veces si la respuesta se perdió.
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
    if (this.cargandoTotal) {
      return;
    }

    this.cargandoTotal = true;
    this.cargando.set(true);
    this.error.set(null);
    this.segundosEsperando.set(0);

    this.temporizadorEspera?.unsubscribe();
    this.temporizadorEspera = interval(1000).subscribe(() => {
      this.segundosEsperando.update((segundos) => segundos + 1);
    });

    const inicio = Date.now();

    // Reintenta hasta que el backend responda o se cumpla la ventana máxima.
    const intentar = (numero: number): Observable<ContadorResponse> =>
      this.contadorService.obtener().pipe(
        timeout(TIMEOUT_PETICION),
        catchError((fallo) => {
          if (Date.now() - inicio >= TIEMPO_MAXIMO_RECONEXION) {
            return throwError(() => fallo);
          }

          return timer(ESPERA_ENTRE_INTENTOS).pipe(
            switchMap(() => intentar(numero + 1))
          );
        })
      );

    intentar(1)
      .pipe(
        finalize(() => {
          this.cargandoTotal = false;
          this.cargando.set(false);
          this.temporizadorEspera?.unsubscribe();
          this.temporizadorEspera = null;
        })
      )
      .subscribe({
        next: ({ total }) => {
          this.total.set(total);
          this.error.set(null);
        },
        error: () => {
          this.error.set(
            'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.'
          );
        }
      });
  }
}
