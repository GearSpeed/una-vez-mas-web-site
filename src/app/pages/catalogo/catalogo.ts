import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { SITIO } from '../../content';
import {
  avisoDisponibilidad,
  precioVisible,
  type Producto,
  waTextoDe,
} from '../../core/models/producto';
import { CatalogService, type Filtro } from '../../core/services/catalog';
import { WhatsappService } from '../../core/services/whatsapp';

@Component({
  selector: 'uvm-catalogo',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './catalogo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalogo {
  private readonly catalogo = inject(CatalogService);
  private readonly wa = inject(WhatsappService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly sitio = SITIO;
  /** Las que existen en el catálogo de hoy: las da de alta la aplicación, no el sitio. */
  protected readonly categorias = this.catalogo.categorias;

  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });

  /**
   * Filtro y búsqueda viven en la URL (`/catalogo?cat=Galletas&q=coco`) para que
   * una vista filtrada se pueda compartir. `linkedSignal` deja que el usuario
   * escriba libremente y se resincroniza si la URL cambia desde fuera (un enlace
   * de Inicio, o el botón atrás del navegador).
   */
  protected readonly filtro = linkedSignal<Filtro>(() => {
    const cat = this.params().get('cat');
    return cat && this.categorias().includes(cat) ? cat : 'todos';
  });
  protected readonly busqueda = linkedSignal(() => this.params().get('q') ?? '');

  protected readonly visibles = computed(() =>
    this.catalogo.filtrar(this.filtro(), this.busqueda()),
  );

  /**
   * Una categoría que existe en la aplicación pero todavía no tiene nada publicado. No
   * es lo mismo que una búsqueda sin resultados, y no se le dice lo mismo a quien mira:
   * aquí no hay nada que corregir, hay algo que va a llegar.
   */
  protected readonly categoriaVacia = computed(() => {
    const filtro = this.filtro();
    return filtro !== 'todos' && this.catalogo.estaVacia(filtro);
  });

  protected readonly conteo = computed(() => {
    const n = this.visibles().length;
    return `Mostrando ${n} delicia${n === 1 ? '' : 's'}`;
  });

  /** Para una categoría que todavía no tiene nada: el interés no se pierde, se encauza. */
  protected readonly waCategoria = computed(() =>
    this.wa.enlace(
      `Hola Una vez más! Vi que ${this.filtro()} viene en camino, ¿me avisan cuando estén?`,
    ),
  );

  protected readonly waPedido = this.wa.enlace('Hola Una vez más! Me gustaría hacer un pedido');
  protected readonly waCotizar = this.wa.enlace(
    'Hola Una vez más! Me interesa cotizar un pedido especial o mesa de dulces para un evento',
  );

  /** Clases de las pastillas de filtro, según esté activa o no. */
  protected readonly tabBase =
    'filter-tab px-5 py-2 rounded-full font-label-md text-label-md transition-all whitespace-nowrap';
  protected readonly tabActivo = `${this.tabBase} bg-primary text-on-primary shadow-sm`;
  protected readonly tabInactivo = `${this.tabBase} bg-surface-container text-on-surface-variant hover:bg-surface-container-high`;

  constructor() {
    // reflejar el estado de los filtros en la URL sin ensuciar el historial
    effect(() => {
      const cat = this.filtro();
      const q = this.busqueda().trim();
      const actuales = this.params();
      if (
        (actuales.get('cat') ?? '') === (cat === 'todos' ? '' : cat) &&
        (actuales.get('q') ?? '') === q
      ) {
        return;
      }
      void this.router.navigate([], {
        queryParams: { cat: cat === 'todos' ? null : cat, q: q || null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  protected filtrarPor(filtro: Filtro): void {
    this.filtro.set(filtro);
  }

  protected buscar(valor: string): void {
    this.busqueda.set(valor);
  }

  protected limpiar(): void {
    this.filtro.set('todos');
    this.busqueda.set('');
  }

  protected waProducto(producto: Producto): string {
    return this.wa.enlace(waTextoDe(producto));
  }

  protected precio(producto: Producto): string | null {
    return precioVisible(producto.precio);
  }

  /** «Últimas piezas» o «Agotado». Que algo esté disponible no hace falta decirlo. */
  protected aviso(producto: Producto): string | null {
    return avisoDisponibilidad(producto.disponibilidad);
  }
}
