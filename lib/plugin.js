const logger = console;

import Connection from './Connection.js'

export default function NuxtWampPlugin(context, inject) {

  const {app} = context;
  let options = JSON.parse('<%= JSON.stringify(options) %>');
  if (process.server) {
    options.max_retries = 0;
    options.ssr = true;
  }

  const connection = new Connection(options);
  inject('wamp', connection);

}
