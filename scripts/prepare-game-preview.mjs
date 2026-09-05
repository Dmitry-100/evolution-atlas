import { cp, mkdir, rm } from 'node:fs/promises';

await mkdir('.deploy', { recursive: true });
await rm('.deploy/game-preview', { recursive: true, force: true });
await cp('dist', '.deploy/game-preview', { recursive: true });
