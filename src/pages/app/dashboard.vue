<template>
    <div>
        <button @click="$emit('logout')">{{ $t('button.logout') }}</button>
    </div>
</template>
<script>
export default {
    name: 'DashboardPage',
    emits: ['logout'],
}
</script>
