const esbuild = require('esbuild')
const path = require('path')

esbuild
  .build({
    entryPoints: ['index.js'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist/index.js',
    minify: true,
    sourcemap: false,
    external: [], // Все зависимости будут включены в бандл
  })
  .then(() => {
    console.log('✓ Build complete')
  })
  .catch(() => process.exit(1))
