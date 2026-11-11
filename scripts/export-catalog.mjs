import { writeFileSync, copyFileSync } from 'node:fs';
import { FASES } from '../src/data/fases.js';
writeFileSync(new URL('../backend/src/main/resources/fases.json', import.meta.url), JSON.stringify(FASES, null, 2) + '\n');

copyFileSync(new URL('../src/data/personalizacao.json', import.meta.url), new URL('../backend/src/main/resources/personalizacao.json', import.meta.url));
