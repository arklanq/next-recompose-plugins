The default way Next.js suggests to enable and configure plugins is unclear and confusing when you have many plugins.

In order to address that `next-recompose-plugins` provides a **clean** 🫧 and **easy** ✅ **API** for Next.js's plugins configuration and composition.

### Table of contents

- [Installation](#installation)
- [Building basic configuration](#building-basic-configuration)
- [Applying plugins](#applying-plugins)

### Installation

```shell
npm install --save next-recompose-plugins
```

or

```shell
yarn add next-recompose-plugins
```

### Building basic configuration

Pass config object directly to `ConfigBuilder.defineConfig` method:

```javascript
// next.config.js
const {ConfigBuilder} = require('next-recompose-plugins');

module.exports = ConfigBuilder.defineConfig({
    // Next.js's config options goes here ...
  })
  .build();
```

You can also use a function. This way you have possibility to define different options based on current phase or args provided by Next.

```javascript
// next.config.js
const {ConfigBuilder} = require('next-recompose-plugins');

module.exports = ConfigBuilder.defineConfig((phase, args) => {
    return {
      ...args.defaultConfig,
      reactStrictMode: true,
      experimental: {},
    };
  })
  .build();
```

Configuration function can also be asynchronous (support in Next.js 12.1+).

```javascript
// next.config.js
const {ConfigBuilder} = require('next-recompose-plugins');

module.exports = ConfigBuilder.defineConfig(async (phase, args) => {
    await something();

    return {
      ...args.defaultConfig,
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
* `args` - args provided by Next
* `config` - the source config object

> Important: Your plugin applying function should take the config object, (optionally) enhance it using a desired plugin then return the object back!

```javascript
// next.config.js
const {ConfigBuilder} = require('next-recompose-plugins');

module.exports = ConfigBuilder.defineConfig({...})
  .applyPlugin((phase, args, config) => {
    // enhance the config with the desired plugin and return it back  
    return bundleAnalyzer({})(config);
  })
  .build();
```

Let's say that you want to apply the plugin only in production build, you can do this easily this way:

```javascript
// next.config.js
const {ConfigBuilder} = require('next-recompose-plugins');
const {PHASE_PRODUCTION_BUILD} = require('next/constants');

module.exports = ConfigBuilder.defineConfig({...})
  .applyPlugin((phase, args, config) => {
    // determine current configuration phase
    if(phase === PHASE_PRODUCTION_BUILD) {
        // enhance the config with the desired plugin and return it back
        return bundleAnalyzer({})(config);
    }
    
    // it's important to always return the config even if no plugins were applied
    return config;
  })
  .build();
```

Plugin applying function can also be asynchronous (support in Next.js 12.1+).

```javascript
// next.config.js
const {ConfigBuilder} = require('next-recompose-plugins');

module.exports = ConfigBuilder.defineConfig({...})
  .applyPlugin(async (phase, args, config) => {
    await something();
  
    // enhance the config with the desired plugin and return it back  
    return bundleAnalyzer({})(config);
  })
  .build();
```

It's a good technique to annotate your plugin applying functions with a name. 
When an error occur there will be a detailed information provided indicating which `applyMethod` invocation function is failing.

```javascript
// next.config.js
const {ConfigBuilder} = require('next-recompose-plugins');

module.exports = ConfigBuilder.defineConfig({...})
  .applyPlugin((phase, args, config) => {
    // enhance the config with the desired plugin and return it back  
    return bundleAnalyzer({})(config);
  }, 'bundle-analyzer') // Pass an annotation as a last argument
  .build();
```

Remember that you can chain `applyPlugin(...)` method as many times as you would like to.

```javascript
// next.config.js
const {ConfigBuilder} = require('next-recompose-plugins');

module.exports = ConfigBuilder.defineConfig({...})
  .applyPlugin(async (phase, args, config) => {...}, 'plugin 1')
  .applyPlugin(async (phase, args, config) => {...}, 'plugin 2')
  .applyPlugin(async (phase, args, config) => {...}, 'plugin 3')
  .build();
```
