/* eslint-env node */

const { spawnSync } = require('child_process');
const Semver = require('semver');
const FS = require('fs');

const pkgRaw = FS.readFileSync('package.json');
FS.writeFileSync('.package.json.bak', pkgRaw);

const pkg = JSON.parse(pkgRaw);
const newVersion = Semver.inc(pkg.version, process.argv[2]);
pkg.version = newVersion;
const newPkgRaw = `${JSON.stringify(pkg, null, 2)}\n`;
FS.writeFileSync('package.json', newPkgRaw);

const lastVersion = getLastTag();
const log = getLogSinceTag(lastVersion);

spawnSync('git', ['add', '-A']);
spawnSync('git', ['commit', '-m', `v${newVersion}`]);
spawnSync(
  'git',
  ['tag', '-a', `v${newVersion}`, '-m', buildTagMessage(newVersion, log)]);

function buildTagMessage(version, logLines) {
  return `v${newVersion}\n

${logLines}`;
}

function getLastTag() {
  return spawnSync('git', ['tag'])
           .stdout
           .toString()
           .trim()
           .split('\n')
           .sort(Semver.rcompare)[0];
}

function getLogSinceTag(tag) {
  return spawnSync('git', ['log', '--oneline', `${tag}..`])
           .stdout
           .toString()
           .trim()
           .split('\n')
           .map(logLine => `- ${logLine}`)
           .join('\n');
}
