import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WhatsappService } from '../../services/whatsapp';

/** Dock flotante que el maquetado repite en las 5 páginas. */
@Component({
  selector: 'uvm-whatsapp-dock',
  templateUrl: './whatsapp-dock.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsappDock {
  protected readonly enlace = inject(WhatsappService).enlace(
    'Hola Una vez más! Me gustaría pedir información',
  );
}
