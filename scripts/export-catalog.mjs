import { writeFileSync } from 'node:fs';
import { FASES } from '../src/data/fases.js';
writeFileSync(new URL('../backend/src/main/resources/fases.json', import.meta.url), JSON.stringify(FASES, null, 2) + '\n');
