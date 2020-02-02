# nuxt-wamp
WAMP Autobahn wrapper for Nuxt.js, served as an SSR compatible Module

## Features
 - Challenge callback for authentication is nuxt context aware
 - Easy usage through injection (global, component, config, app, store)
 - Subscriptions and registrations from a component will get automatically destroyed with the component

## Example

```js
// nuxt.config.js

// wrapper around onchallenge
const challenger = (context) => {
  const { req } = context
  // onchallenge itself
  return (session, method, extra) => {
    if(req) {
      // get some cookie?
      return 'server'
    } else {
      // get some cookie?
      return 'client'
    }
  }
}

export default {
  // ...
  modules: [
    // ...
    ['nuxt-wamp', { url: 'ws://localhost:4000/', realm: 'realm1', challenger }]
  ]
  // ...
}
```

```vue
<!-- component.vue -->

<script>
  export default {
    data() {
      return {
        time: '',
      }
    },
    wamp: {
      subscribe: {
        time(args, kwArgs, details) {
          this.time = args[0]
        }
      }
    },
    methods: {
      async trigger() {
        let res = await this.$wamp.call('trigger')
        console.log(res)
      },
    }
  }
</script>

<template>
  <div>
    <h1>{{ time }}</h1>
    <hr />
    <button @click="trigger">Boom!</button>
  </div>
</template>
```

## Todo
 - Meaningful tests
 - TypeScript generation
