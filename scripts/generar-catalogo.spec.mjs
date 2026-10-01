/**
 * El script que baja el catálogo tiene un trabajo delicado: decidir cuándo NO escribir.
 * Si se tragara una respuesta rara, el sitio se publicaría con el catálogo roto y sin
 * que nadie se enterara hasta verlo en vivo.
 *
 * Estas pruebas levantan un servidor de mentira y comprueban que, pase lo que pase, la
 * copia del repositorio queda intacta y el build puede seguir (código de salida 0).
 *
 *   npm run test:scripts
 */
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'src/app/content/catalogo.json');
const script = join(raiz, 'scripts/generar-catalogo.mjs');
const ejecutar = promisify(execFile);

/** Lo que responde el servidor de mentira; cada prueba lo cambia. */
let responder = () => ({ estado: 200, cuerpo: '{"categorias":[],"productos":[]}' });
let url = '';
let servidor;

beforeAll(async () => {
  servidor = createServer((_, respuesta) => {
    const { estado, cuerpo } = responder();
    respuesta.writeHead(estado, { 'Content-Type': 'application/json' });
    respuesta.end(cuerpo);
  });
  await new Promise((listo) => servidor.listen(0, '127.0.0.1', listo));
  url = `http://127.0.0.1:${servidor.address().port}/catalogo`;
});

afterAll(async () => {
  await new Promise((listo) => servidor.close(listo));
});

const correr = (CATALOGO_URL) =>
  ejecutar(process.execPath, [script], { env: { ...process.env, CATALOGO_URL } });

describe('generar-catalogo', () => {
  const antes = () => readFileSync(destino, 'utf8');

  it('deja la copia intacta si la respuesta no cumple el contrato', async () => {
    const original = antes();
    responder = () => ({
      estado: 200,
      // Le falta `imagen`, que el contrato promete que nunca viene vacía.
      cuerpo: JSON.stringify({
        categorias: ['Galletas'],
        productos: [{ slug: 'galletas-avena', nombre: 'Galletas de Avena' }],
      }),
    });
    const { stderr } = await correr(url);

    expect(readFileSync(destino, 'utf8')).toBe(original);
    expect(stderr).toMatch(/no cumplen el contrato/);
  });

  it('deja la copia intacta si la API responde un error', async () => {
    const original = antes();
    responder = () => ({ estado: 500, cuerpo: 'vaya' });
    const { stderr } = await correr(url);

    expect(readFileSync(destino, 'utf8')).toBe(original);
    expect(stderr).toMatch(/respondió 500/);
  });

  it('deja la copia intacta si no hay a quién preguntarle', async () => {
    const original = antes();
    const { stderr } = await correr('http://127.0.0.1:1/catalogo');

    expect(readFileSync(destino, 'utf8')).toBe(original);
    expect(stderr).toMatch(/no se pudo leer/);
  });

  it('deja la copia intacta si el catálogo llega vacío', async () => {
    const original = antes();
    responder = () => ({ estado: 200, cuerpo: '{"categorias":[],"productos":[]}' });
    const { stderr } = await correr(url);

    expect(readFileSync(destino, 'utf8')).toBe(original);
    expect(stderr).toMatch(/sin categorías o sin productos/);
  });

  it('deja la copia intacta si llega la forma vieja, un arreglo suelto', async () => {
    const original = antes();
    responder = () => ({ estado: 200, cuerpo: '[]' });
    const { stderr } = await correr(url);

    expect(readFileSync(destino, 'utf8')).toBe(original);
    expect(stderr).toMatch(/forma \{ categorias, productos \}/);
  });

  it('deja la copia intacta si un escalón de descuento viene mal formado', async () => {
    const original = antes();
    responder = () => ({
      estado: 200,
      cuerpo: JSON.stringify({
        categorias: [
          {
            nombre: 'Galletas',
            vitrina: null,
            // `desde` debería ser number, no texto.
            descuentoVolumen: [{ desde: '6', tasa: '0.1000' }],
          },
        ],
        productos: [
          {
            slug: 'galletas-avena',
            nombre: 'Galletas de Avena',
            categoria: 'Galletas',
            resumen: '',
            descripcion: '',
            ingredientes: [],
            precio: null,
            presentacion: null,
            disponibilidad: 'disponible',
            imagen: { url: '', urlChica: '', alt: '', esPlaceholder: true },
            destacado: null,
          },
        ],
      }),
    });
    const { stderr } = await correr(url);

    expect(readFileSync(destino, 'utf8')).toBe(original);
    expect(stderr).toMatch(/no cumplen el contrato/);
  });
});
