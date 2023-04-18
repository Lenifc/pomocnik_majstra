<template>
    <div class="manage-vehicles">
        <div class="fetch-buttons">
            <Button
                :label="$t('button.add_vehicle')"
                icon="pi pi-plus-circle"
                class="button p-button-outlined p-button-success"
                @click="openVehicleAddForm"
            />
            <Button
                v-if="showFetchMoreButton"
                class="button p-button-secondary"
                :label="$t('button.fetch_all_vehicles')"
                :icon="
                    !recivedVehicles || isLoading
                        ? 'pi pi-spin pi-spinner'
                        : 'pi pi-download'
                "
                @click="fetchAllVehicles"
            />
        </div>
        <VehiclesWrapper
            :received-vehicles="recivedVehicles"
            :is-loading="isLoading"
        />
    </div>
</template>
<script>
import VehiclesWrapper from '@/components/views/manage-vehicles/VehiclesWrapper.vue'
import Button from 'primevue/button'
import ROUTES from '@/router/routes'

export default {
    name: 'VehiclesPage',
    components: {
        VehiclesWrapper,
        Button,
    },
    computed: {
        recivedVehicles: {
            get() {
                return this.$store.state.vehicles?.vehicleList
            },
        },
        isLoading() {
            return !!this.$store.state.vehicles?.loadingState
        },
        showFetchMoreButton() {
            return (
                this.recivedVehicles?.length < this.$store.state.vehicles?.total
            )
        },
    },
    beforeCreate() {
        this.$store.dispatch('getVehicles')
    },
    methods: {
        openVehicleAddForm() {
            this.$router.push(ROUTES.ADD_NEW_VEHICLE)
        },
        fetchAllVehicles() {
            this.$store.dispatch('getVehicles', 'all')
        },
    },
}
</script>
<style scoped lang="scss">
.manage-vehicles {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 2rem;
    padding-bottom: 4rem;

    .fetch-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;

        .button {
            font-size: 1.6rem;
        }
    }
}
</style>
