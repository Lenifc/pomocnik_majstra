<template>
    <div class="input-base">
        <div v-if="$slots.label" class="label">
            <slot name="label" />
        </div>
        <input :value="modelValue" v-bind="$attrs" @input="onInput" />
    </div>
</template>
<script>
export default {
    name: 'InputBase',
    props: {
        modelValue: {
            type: [String, Number],
            default: null,
        },
    },
    emits: ['update:modelValue'],
    methods: {
        onInput(event) {
            this.$emit('update:modelValue', event.target.value)
        },
    },
}
</script>
<style lang="scss" scoped>
.input-base {
    .label {
        padding-bottom: 0.5rem;
        padding-left: 1rem;
        font-size: 1.4rem;
        letter-spacing: 0.1rem;
        text-transform: uppercase;
    }

    input {
        border: 1px solid var(--custom-grayblue);
        border-radius: 0.4rem;
        background-color: var(--custom-very-dark-blue);
        color: var(--grayscale-light);
        padding: 0.8rem 1.2rem;
        width: 100%;

        &:hover {
            border: 1px solid var(--grayscale-light-hover);
        }

        &:focus {
            outline: 1.5px solid var(--blue-100);
        }
    }
}
</style>
