<script>
export default {
    async asyncData () {
        const time = await this.$wamp.call('time')
        return {
            time
        }
    },
    data () {
        return {
            time: 'Waiting on server...'
        }
    }
}
</script>

<template>
  <div class="ssr">
    <h2>{{ time }}</h2>
  </div>
</template>

<style>
    .ssr {
    }
</style>
