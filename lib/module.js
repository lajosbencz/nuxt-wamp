const path = require('path');
const consola = require('consola');
const semver = require('semver');

const logger = consola.withScope('nuxt:wamp');

function NuxtWampModule(_moduleOptions) {

  const options = {...this.options.wamp, ..._moduleOptions};

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: 'wamp.js',
    options
  });

  this.options.build = this.options.build || {};
  this.options.build.transpile = this.options.build.transpile || {};
  // transpile only for non-modern build
  // istanbul ignore if
  if (semver.gte(semver.coerce(this.nuxt.constructor.version), '2.9.0')) {
    this.options.build.transpile.push(({isLegacy}) => isLegacy && 'ws');
    this.options.build.transpile.push(({isLegacy}) => isLegacy && 'autobahn');
    this.options.build.transpile.push(({isLegacy}) => isLegacy && 'nuxt-wamp');
  } else {
    this.options.build.transpile.push('ws');
    this.options.build.transpile.push('autobahn');
    this.options.build.transpile.push('nuxt-wamp');
  }

  if (options.url) {
    logger.debug(`url: ${options.url}`);
  }
  if (options.transports) {
    for (let tp of options.transports) {
      logger.debug(`transport: ${tp.url}`);
    }
  }

}

module.exports = NuxtWampModule;
module.exports.meta = require('../package.json');
