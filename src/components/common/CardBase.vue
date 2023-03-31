<template>
    <div class="card-base" :width="width">
        <div v-if="closeable" class="close-form" @click="$emit('close')">
            &times;
        </div>
        <div class="title">
            <slot name="title" />
        </div>
        <slot />
    </div>
</template>
<script>
export default {
    name: 'CardBase',
    props: {
        closeable: {
            type: Boolean,
            required: false,
            default: false,
        },
        width: {
            type: [String, Number],
            required: false,
            default: 500,
        },
    },
    emits: ['close'],
}
</script>
<style lang="scss" scoped>
.card-base {
    padding: 3rem;
    border-radius: 0.6rem;
    background-color: var(--custom-dark-blue);
    position: relative;

    .close-form {
        position: absolute;
        top: 0;
        right: 1.2rem;
        font-size: 3.5rem;
        cursor: pointer;
    }

    .title {
        font-size: 3.3rem;
        font-weight: bold;
        padding-bottom: 2rem;
    }
}
</style>
