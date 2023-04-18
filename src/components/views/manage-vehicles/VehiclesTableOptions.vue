<template>
    <div class="data-table-options-wrapper">
        <i
            v-tooltip.bottom="$t('table_option.edit_vehicle_data')"
            class="fas fa-edit"
            @click="openVehicleEditForm(data)"
        ></i>
        <i
            v-tooltip.right="$t('table_option.delete_vehicles_data')"
            class="fas fa-trash-alt"
            @click="confirmDeleteModal(data, data.VIN)"
        ></i>
        <i
            v-tooltip.bottom="$t('table_option.clients_data')"
            class="fas fa-info-circle"
            @click="redirectToCarDetails(data)"
        ></i>
        <i
            v-if="data?.Tel"
            v-tooltip.right="$t('table_option.delete_vehicle_connections')"
            class="pi pi-user-minus"
            @click="relocateFunc(data, data.VIN)"
        ></i>
        <i
            v-else
            v-tooltip.right="$t('table_option.assign_vehicle_to_client')"
            class="pi pi-user-plus"
            @click="openVehicleEditForm(data)"
        ></i>
    </div>
</template>
<script>
export default {
    name: 'VehiclesTableOptions',
    props: {
        data: {
            type: Object,
            required: true,
        },
    },
    methods: {
        openVehicleEditForm() {},
        confirmDeleteModal() {},
        redirectToCarDetails() {},
        relocateFunc() {},
    },
}
</script>
<style lang="scss" scoped>
.data-table-options-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;

    i {
        font-size: 2rem;
    }
}
</style>
