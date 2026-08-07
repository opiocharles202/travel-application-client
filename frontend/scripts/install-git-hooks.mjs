// simple-git-hooks assumes package.json and .git are in the same directory.
// In this repo .git lives one level up (the project root), so its own
// auto-detection resolves nothing and silently writes hooks nowhere. This
// script finds the real git hooks directory and writes the pre-commit hook
// there directly, cross-platform, no extra dependency.
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, chmodSync } from 'node:fs'
import { join } from 'node:path'

const HOOK_CONTENT = `#!/bin/sh

if [ "$SKIP_SIMPLE_GIT_HOOKS" = "1" ]; then
    echo "[INFO] SKIP_SIMPLE_GIT_HOOKS is set to 1, skipping hook."
    exit 0
fi

cd "$(git rev-parse --show-toplevel)/frontend" && npx lint-staged && npm run typecheck
`

function main() {
  let gitDir
  try {
    gitDir = execFileSync('git', ['rev-parse', '--git-common-dir'], {
      encoding: 'utf8',
      cwd: process.cwd(),
    }).trim()
  } catch {
    console.log('[install-git-hooks] Not inside a git repository, skipping.')
    return
  }

  const hooksDir = join(gitDir, 'hooks')
  mkdirSync(hooksDir, { recursive: true })
  const hookPath = join(hooksDir, 'pre-commit')
  writeFileSync(hookPath, HOOK_CONTENT)
  chmodSync(hookPath, 0o755)
  console.log(`[install-git-hooks] Wrote pre-commit hook to ${hookPath}`)
}

main()
