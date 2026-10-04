import type { createModuleFederationConfig } from '@module-federation/sdk';

import packageJson from './package.json' with { type: 'json' };

// Microfrontend api, should match across gateway and microservices.
const apiVersion = '0.0.1';

const sharedDefaults = { singleton: true, strictVersion: true, requiredVersion: apiVersion };
// Application modules are not installed packages, `import` points the federation plugin to the source file.
const shareMappings = (...mappings: string[]) =>
  Object.fromEntries(mappings.map(map => [map, { ...sharedDefaults, version: apiVersion, import: `./src/main/webapp/${map}` }]));

const shareDependencies = ({ skipList = [] }: { skipList?: string[] } = {}) =>
  Object.fromEntries(
    Object.entries(packageJson.dependencies)
      .filter(([dependency]) => !skipList.includes(dependency))
      .map(([dependency, version]) => [dependency, { ...sharedDefaults, version, requiredVersion: version }]),
  );

export default {
  name: 'jhipsterapp',
  exposes: {
    './entities-menu': './app/entities/menu',
    './entities-routes': './app/entities/routes',
    // jhipster-needle-expose
  },
  filename: 'remoteEntry.js',
  shareScope: 'default',
  shared: {
    ...shareDependencies(),
    ...shareMappings(
      'app/config/constants',
      'app/config/store',
      'app/shared/error/error-boundary-routes',
      'app/shared/layout/menus/menu-components',
      'app/shared/layout/menus/menu-item',
      'app/shared/reducers',
      'app/shared/reducers/locale',
      'app/shared/reducers/reducer.utils',
      'app/shared/util/date-utils',
      'app/shared/util/entity-utils',
    ),
  },
  dts: false,
  manifest: true,
} as const satisfies Parameters<typeof createModuleFederationConfig>[0];
