import { URL, fileURLToPath } from 'node:url';

import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import federationConfig from './module-federation.config.ts';

const development = process.env.NODE_ENV !== 'production';

const config = defineConfig({
  plugins: [react(), federation(federationConfig)],
  root: fileURLToPath(new URL('./src/main/webapp/', import.meta.url)),
  publicDir: fileURLToPath(new URL('./target/classes/static/public', import.meta.url)),
  cacheDir: fileURLToPath(new URL('./target/.vite-cache', import.meta.url)),
  build: {
    emptyOutDir: true,
    outDir: fileURLToPath(new URL('./target/classes/static/', import.meta.url)),
    modulePreload: false,
    // Allow topLevelAwait by default, Use 'vite-plugin-top-level-await' plugin for lower target
    target: ['chrome89', 'edge89', 'firefox89', 'safari15'],
    minify: !development,
    rolldownOptions: {
      input: {
        app: fileURLToPath(new URL('./src/main/webapp/index.html', import.meta.url)),
      },
      output: {
        // Split the vendor code into cacheable chunks instead of one oversized bundle.
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/, priority: 40 },
            { name: 'vendor-redux', test: /node_modules[\\/](@reduxjs[\\/]toolkit|react-redux|redux|immer|reselect)[\\/]/, priority: 30 },
            { name: 'vendor-bootstrap', test: /node_modules[\\/](react-bootstrap|@restart|bootstrap)[\\/]/, priority: 20 },
            { name: 'vendor-fontawesome', test: /node_modules[\\/]@fortawesome[\\/]/, priority: 10 },
            { name: 'vendor', test: /node_modules[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    DEVELOPMENT: JSON.stringify(development),
    // APP_VERSION is passed as an environment variable from the Gradle / Maven build tasks.
    VERSION: JSON.stringify(process.env.APP_VERSION || 'DEV'),
    // If this URL is left empty (""), then it will be relative to the current context.
    // If you use an API server, in `prod` mode, you will need to enable CORS
    // (see the `jhipster.cors` common JHipster property in the `application-*.yml` configurations)
    SERVER_API_URL: '""',
    // react-jhipster requires LOG_LEVEL config.
    'process.env.LOG_LEVEL': JSON.stringify(development ? 'info' : 'error'),
  },
  server: {
    host: true,
    port: 9000,
    proxy: Object.fromEntries(
      ['/api', '/services', '/management', '/v3/api-docs'].map(res => [
        res,
        {
          target: 'http://localhost:8080',
        },
      ]),
    ),
  },
});

// jhipster-needle-add-vite-config - JHipster will add custom config

export default config;
