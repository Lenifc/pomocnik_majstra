<template>
    <div class="view-wrapper">
        <slot />
    </div>
</template>
<style scoped lang="scss">
.view-wrapper {
    display: flex;
    justify-content: center;
    width: 120rem;
    height: 100%;
    margin: 0 auto;
    padding-top: 5rem;
}
</style>
