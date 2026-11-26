// Rules for commit messages. Conventional Commits with a fixed list of types and scopes.
// The reasoning is in docs/decisions.md (D-025, D-026), the short version in AGENTS.md section 5.
// To add a scope, first add a decision to docs/decisions.md, then extend SCOPES here.

export const TYPES = ['feat', 'fix', 'refactor', 'perf', 'style', 'docs', 'test', 'build', 'ci', 'chore']

export const SCOPES = ['logic', 'scene', 'fx', 'input', 'ui', 'deps', 'ci', 'release']

// These types change what the game does or how it behaves, so they always name an area.
const SCOPE_REQUIRED_FOR = ['feat', 'fix', 'refactor', 'perf']

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'scope-required-for-types': ({ type, scope }, when, types) => {
          const required = types.includes(type ?? '') && !scope
          return [!required, `a scope is required for "${type}" commits, use one of: ${SCOPES.join(', ')}`]
        },
        'scope-single': ({ scope }) => {
          const ok = !scope || !/[\s,/\\]/.test(scope)
          return [ok, 'use exactly one scope, split the change into several commits otherwise']
        },
      },
    },
  ],
  rules: {
    'type-enum': [2, 'always', TYPES],
    'scope-enum': [2, 'always', SCOPES],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-required-for-types': [2, 'always', SCOPE_REQUIRED_FOR],
    'scope-single': [2, 'always'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
}
