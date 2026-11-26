/*
    Publishes the production build to the GitHub Pages directory (docs/):

    - dist/*               -> docs/<version>/ (replacing any previous copy)
    - src/app/studies/**   -> docs/<version>/studies/
    - src/project_lander/* -> docs/

    Run through `npm run release`, which builds first. Dotfiles in the source
    directories are skipped, except .nojekyll.
*/

import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const dist = join(root, 'dist');
const docs = join(root, 'docs');
const target = join(docs, version);

if (!existsSync(join(dist, 'index.html'))) {
    console.error('No build found in dist/. Run `npm run build` first.');
    process.exit(1);
}

const skipDotfiles = (src) => {
    const name = basename(src);
    return !name.startsWith('.') || name === '.nojekyll';
};

rmSync(target, { recursive: true, force: true });
cpSync(dist, target, { recursive: true });
cpSync(join(root, 'src/app/studies'), join(target, 'studies'), {
    recursive: true,
    filter: skipDotfiles
});
cpSync(join(root, 'src/project_lander'), docs, {
    recursive: true,
    filter: skipDotfiles
});

console.log(`Published version ${version} to docs/${version}/`);
