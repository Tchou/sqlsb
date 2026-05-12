import { execSync } from 'child_process';
import { readFileSync, cpSync, renameSync, existsSync, rmSync } from 'fs';

const single = "dist/sqlsb.html"
const dist = "dist"

const { name, version } = JSON.parse(readFileSync('./package.json', 'utf8'));
const base = `${name}-v${version}`;

if (existsSync(base)) rmSync(base, { recursive: true });
cpSync(dist, base, { recursive: true });
execSync(`zip -r ${base}.zip ${base}/`, { stdio: 'inherit' });
rmSync(base, { recursive: true });

renameSync(single, `${base}.html`);

console.log(`Created ${base}.zip and ${base}.html`);
