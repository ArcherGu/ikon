import lightwing from '@lightwing/eslint-config'

export default lightwing(
  {
    ignores: [
      'dist',
      'node_modules',
      '*.svelte',
      '*.snap',
      '*.d.ts',
      'coverage',
      'js_test',
      'apps/**/assets',
      'apps/**/dist',
      'local-data',
    ],
    unocss: true,
  },
)
