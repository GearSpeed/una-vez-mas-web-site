import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WhatsappService } from '../../core/services/whatsapp';

/** El maquetado no tenía 404; una URL mal escrita caía en blanco. */
@Component({
  selector: 'uvm-no-encontrada',
  imports: [RouterLink],
  templateUrl: './no-encontrada.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoEncontrada {
  protected readonly wa = inject(WhatsappService).enlace(
    'Hola Una vez más! Llegué a un enlace que no funciona, ¿me ayudan?',
  );
}
