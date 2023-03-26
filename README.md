The default way Next.js suggests to enable and configure plugins is unclear and confusing when you have many plugins.
Sometimes we even use plugins that do not have a standardized API, so our code becomes even more obscure.

In order to address that `next-recompose-plugins` provides a **clean** 🫧 and **easy** ✅ **API** for Next.js's plugins configuration and composition.

### Table of contents

- [Quick showcase](#quick-showcase)
- [Installation](#installation)
- [Building basic configuration](#building-basic-configuration)
- [Applying plugins](#applying-plugins)
- [Real world example](#real-world-example)

### Quick showcase

For those who don't like to read a lot.

```javascript
const config = new Config(async () => {
    await something();
  
    return {...};
  })
  .applyPlugin((phase, args, config) => {
    return plugin1(config);
  }, 'plugin-1')
  .applyPlugin((phase, args, config) => {
    return plugin2(config);
  }, 'plugin-2')
  .applyPlugin((phase, args, config) => {
    return plugin3(config);
  }, 'plugin-3')
  .build();
```

> Also make sure to see [Real world example](#real-world-example)

### Installation

```shell
npm install --save next-recompose-plugins
```

or

```shell
yarn add next-recompose-plugins
```

### Building basic configuration

Pass config object directly to `Config` class constructor:

```javascript
// next.config.js
const {Config} = require('next-recompose-plugins');

module.exports = new Config({
    // Next.js's config options goes here ...
  })
  .build();
```

You can also use a function. This way you have possibility to define different options based on current phase or args provided by Next.

```javascript
// next.config.js
const {Config} = require('next-recompose-plugins');

module.exports = new Config((phase, args) => {
    return {
      reactStrictMode: true,
      experimental: {},
    };
  })
  .build();
```

Configuration function can also be **async** (supported in Next.js 12.1+).

```javascript
// next.config.js
const {Config} = require('next-recompose-plugins');

module.exports = new Config(async (phase, args) => {
    await something();

    return {
      reactStrictMode: true,
      experimental: {},
    };
  })
  .build();
```

### Applying plugins

Let's apply `@next/bundle-analyzer` plugin by chaining `applyPlugin` method.
Pass a function to `applyPlugin(...)` method which accepts the following arguments:
* `phase` - current configuration phase as one of the constants of `next/constants`;
* `args` - args provided by Next;
* `config` - the source config object.

> Important: Your plugin applying function should take the config object, (optionally) enhance it using a desired plugin then return the object back!

```javascript
// next.config.js
const {Config} = require('next-recompose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer');

module.exports = new Config({...})
  .applyPlugin((phase, args, config) => {
    // enhance the config with the desired plugin and return it back  
    return withBundleAnalyzer({})(config);
  })
  .build();
```

Let's say that you want to apply the plugin only in production build, you can do this easily this way:

```javascript
// next.config.js
const {Config} = require('next-recompose-plugins');
const {PHASE_PRODUCTION_BUILD} = require('next/constants');
const withBundleAnalyzer = require('@next/bundle-analyzer');

module.exports = new Config({...})
  .applyPlugin((phase, args, config) => {
    // determine current configuration phase
    if(phase === PHASE_PRODUCTION_BUILD) {
        // enhance the config with the desired plugin and return it back
        return withBundleAnalyzer({})(config);
    }
    
    // it's important to always return the config even if no plugins were applied
    return config;
  })
  .build();
```

Plugin applying function can also be **async** (support in Next.js 12.1+).

```javascript
// next.config.js
const {Config} = require('next-recompose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer');

module.exports = new Config({...})
  .applyPlugin(async (phase, args, config) => {
    await something();
  
    // enhance the config with the desired plugin and return it back  
    return withBundleAnalyzer({})(config);
  })
  .build();
```

It's a good technique to annotate your plugin applying functions with a name. 
When an error occur there will be a detailed information provided indicating which `applyMethod` invocation function is failing.

```javascript
// next.config.js
const {Config} = require('next-recompose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer');

module.exports = new Config({...})
  .applyPlugin((phase, args, config) => {
    // Uhh.. what's going on here!?
    throw new Error('Test');
  
    // enhance the config with the desired plugin and return it back  
    return withBundleAnalyzer({})(config);
  }, 'bundle-analyzer') // Pass an annotation as a last argument
  .build();
```

```log
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
An error occurred while applying the plugin (bundle-analyzer).
Error: Test
    at path-to-project-dir/next.config.js:11:11
    at path-to-project-dir/node_modules/next-recompose-plugins/dist/cjs/main.js:130:44
    at async Object.normalizeConfig (path-to-project-dir/node_modules/next/dist/server/config-shared.js:130:12)
    at async Object.loadConfig [as default] (path-to-project-dir/node_modules/next/dist/server/config.js:87:28)
    at async NextServer.prepare (path-to-project-dir/node_modules/next/dist/server/next.js:134:24)
    at async path-to-project-dir/node_modules/next/dist/cli/next-dev.js:585:17

```

Remember that you can chain `applyPlugin(...)` methods as many times as you would like to.

```javascript
// next.config.js
const {Config} = require('next-recompose-plugins');

module.exports = new Config({...})
  .applyPlugin(async (phase, args, config) => {...}, 'plugin 1')
  .applyPlugin(async (phase, args, config) => {...}, 'plugin 2')
  .applyPlugin(async (phase, args, config) => {...}, 'plugin 3')
  .build();
```

### Real world example

```javascript
const path = require('path');
const {Config} = require('next-recompose-plugins');
const {PHASE_PRODUCTION_BUILD} = require('next/constants');
const withBundleAnalyzer = require('@next/bundle-analyzer');
const withExportImages = require('next-export-optimize-images');
const {withSentryConfig} = require('@sentry/nextjs');

const config = new Config(async () => {
  await something();

  return {
    reactStrictMode: true
  };
})
  .applyPlugin((phase, args, config) => {
    return withBundleAnalyzer({enabled: phase === PHASE_PRODUCTION_BUILD})(config);
  }, '@next/bundle-analyzer')
  .applyPlugin((phase, args, config) => {
    return withExportImages(config, {
      configPath: 'next-export-optimize-images.config.js',
    });
  }, 'next-export-optimize-images')
  .applyPlugin((phase, args, config) => {
    // Sentry plugin does not follow community guidelines according valid plugin shape

    config.sentry = {
      disableServerWebpackPlugin: true,
      hideSourceMaps: true,
    };

    let newConfig = withSentryConfig(config, {
      silent: true,
      configFile: path.resolve(__dirname, './.config/sentry/sentry.properties'),
    });

    if (typeof newConfig === 'function') newConfig = newConfig(phase, args);

    return newConfig;
  }, '@sentry/nextjs')
  .build();

module.exports = config;
```
