import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // The game logic has no DOM and no Three.js, so plain Node is enough.
      environment: 'node',
      include: ['src/**/*.spec.ts', 'tests/**/*.spec.ts'],
      // The first specs arrive with the game logic (backlog F1). Until then an empty run is fine.
      passWithNoTests: true,
    },
  }),
)
