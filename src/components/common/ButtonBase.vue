<template>
    <button :class="['button-base', $attrs.type]">
        <slot name="icon" />
        <slot />
    </button>
</template>

<script>
export default {
    name: 'ButtonBase',
}
</script>
<style scoped lang="scss">
.button-base {
    padding: 1rem 1.5rem;
    font-size: 1.6rem;
    font-weight: 500;
    background-color: var(--bluegray-300);
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;

    &:hover {
        box-shadow: 0 0.4rem 0.8rem var(--bluegray-600);
    }

    &:focus {
        opacity: 0.85;
    }

    &.no-background {
        background: none;
        box-shadow: none;
        color: var(--blue-300);
    }

    &.success {
        background-color: var(--green-400);
    }

    &.error {
        background-color: var(--pink-800);
        color: white;
    }

    &.info {
        background-color: var(--blue-400);
    }

    &.primary {
        background-color: var(--blue-300);
    }

    &.secondary {
        background-color: var(--purple-500);
    }
}
</style>
