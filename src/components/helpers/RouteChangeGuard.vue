<template><div></div></template>
<script>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
    name: 'RouteChangeGuard',
    emits: ['route-changed'],
    setup(props, { emit }) {
        const route = useRoute()

        watch(
            () => route.path,
            () => emit('route-changed'),
        )
    },
}
</script>
