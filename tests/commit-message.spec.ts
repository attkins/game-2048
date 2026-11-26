import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Runs the real commitlint CLI with the real config, so the rules and these examples cannot drift apart.
const cli = resolve('node_modules/@commitlint/cli/cli.js')

function lint(message: string): Promise<{ ok: boolean; output: string }> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [cli])
    let output = ''
    child.stdout.on('data', (chunk: Buffer) => (output += chunk.toString()))
    child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()))
    child.on('error', reject)
    child.on('close', (code) => resolvePromise({ ok: code === 0, output }))
    child.stdin.end(message)
  })
}

describe('commit messages', { timeout: 30_000 }, () => {
  it.concurrent.each([
    'feat(logic): merge once per move (F1)',
    'fix(input): ignore swipes below the threshold',
    'refactor(scene): split the chip builder',
    'perf(fx): reuse spark particles',
    'style(ui): align the score badges',
    'docs: add the commit scopes to AGENTS.md',
    'test: cover the spawn rules',
    'build: update vite',
    'ci: run the tests before the deploy',
    'chore(deps): update three',
    'chore(release): 0.1.0',
  ])('accepts "%s"', async (message) => {
    const result = await lint(message)
    expect(result.output).toBe('')
    expect(result.ok).toBe(true)
  })

  it.concurrent.each([
    ['feat: add the toy board', 'scope-required-for-types'],
    ['fix: wrong score after a merge', 'scope-required-for-types'],
    ['feat(game): add board logic', 'scope-enum'],
    ['feat(chips): add the chip model', 'scope-enum'],
    ['feat(Logic): add board logic', 'scope-case'],
    ['feat(logic,ui): add score and badges', 'scope-single'],
    ['feature(logic): add board logic', 'type-enum'],
    ['add board logic', 'type-empty'],
    ['feat(logic): Add board logic', 'subject-case'],
    ['feat(logic): add board logic.', 'subject-full-stop'],
    ['feat(logic):', 'subject-empty'],
    [`feat(logic): ${'a'.repeat(70)}`, 'header-max-length'],
  ])('rejects "%s" because of %s', async (message, rule) => {
    const result = await lint(message)
    expect(result.ok).toBe(false)
    expect(result.output).toContain(`[${rule}]`)
  })

  it('ignores merge commits', async () => {
    expect((await lint("Merge branch 'main' into feature")).ok).toBe(true)
  })
})
