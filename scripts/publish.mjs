/*
    The release script (`npm run release`). Lints, tests and builds the app,
    then publishes the build to the GitHub Pages directory (docs/):

    - dist/*               -> docs/<version>/
    - src/app/studies/**   -> docs/<version>/studies/
    - src/project_lander/* -> docs/

    <version> is the version in package.json. If docs/<version>/ exists
    already, the script stops before anything else, unless it is run with
    --force (`npm run release -- --force`), which replaces it. Dotfiles in the
    source directories are skipped, except .nojekyll.
*/

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

// Any other argument stops the script, so that e.g. --dry-run doesn't
// make a real release
let force;
try {
    ({ values: { force } } = parseArgs({
        options: { force: { type: 'boolean', default: false } }
    }));
} catch (error) {
    if (!error.code?.startsWith('ERR_PARSE_ARGS_')) {
        throw error;
    }
    console.error(`${error.message}.\nUsage: npm run release [-- --force]`);
    process.exit(1);
}

const root = fileURLToPath(new URL('..', import.meta.url));
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const dist = join(root, 'dist');
const docs = join(root, 'docs');
const target = join(docs, version);

// Checked first, so a forgotten version bump fails before the build
if (existsSync(target) && !force) {
    console.error(
        `docs/${version}/ already exists: version ${version} is published.\n` +
        'Bump the version in package.json, or run `npm run release -- --force` ' +
        `to replace docs/${version}/.`
    );
    process.exit(1);
}

// The build type checks first
for (const command of ['npm run lint', 'npm test', 'npm run build']) {
    const { status } = spawnSync(command, { cwd: root, shell: true, stdio: 'inherit' });
    if (status !== 0) {
        console.error(`\`${command}\` failed. Nothing was published.`);
        process.exit(status || 1);
    }
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
