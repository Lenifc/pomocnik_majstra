<template>
    <div class="view-wrapper">
        <slot />
    </div>
</template>
<style scoped lang="scss">
.view-wrapper {
    display: flex;
    justify-content: center;
    height: 100%;
    padding-top: 5rem;
    padding-left: 5%;
    width: min(95%, 1600px);
    margin: 0 auto;

    @media (max-width: 1200px) {
        padding-left: 65px;
    }

    @media (max-width: 600px) {
        padding-left: 50px;
    }
}
</style>
