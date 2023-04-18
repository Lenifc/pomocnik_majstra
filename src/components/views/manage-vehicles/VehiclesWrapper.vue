<template>
    <div class="vehicles-wrapper">
        <DataTable
            v-model:filters="tableFilters"
            :value="receivedVehicles"
            responsive-layout="stack"
            breakpoint="1200px"
            striped-rows
            paginator
            :rows="20"
            show-gridlines
            filter-display="menu"
            :loading="!receivedVehicles.length || isLoading"
            class="vehicles-data-table"
            data-key="VIN"
        >
            <template #header>
                <div class="table-header">
                    <Button
                        icon="pi pi-filter-slash"
                        :label="$t('common.clear_filters')"
                        class="p-button-outlined"
                        @click="clearTableFilters"
                    />
                    <div class="count-vehicles">
                        {{
                            $t('manage_vehicles.loaded_vehicles', {
                                count: receivedVehicles?.length ?? 0,
                                total: totalNumberOfVehicles ?? 0,
                            })
                        }}
                    </div>
                    <InputFilter
                        ref="inputFilter"
                        @update-filters="
                            newFilters => (tableFilters = newFilters)
                        "
                    />
                </div>
            </template>
            <template #empty>{{ $t('data_table.empty') }}</template>
            <template #loading>{{ $t('data_table.loading') }}</template>
            <!-- class do not work on Columns... width: 0 works same as fit-content -->
            <Column style="width: 0">
                <template #body="{ index }">
                    {{ index + 1 }}
                </template>
            </Column>
            <Column
                :header="$t('data_table.header.options')"
                style="width: 8rem"
            >
                <template #body="{ data }">
                    <VehiclesTableOptions :data="data" />
                </template>
            </Column>
            <Column field="Tel2" style="display: none" />
            <Column
                field="Tel"
                :header="$t('data_table.header.phone_number')"
                style="width: 14rem"
            >
                <template #body="{ data }">
                    <div @dblclick="copyValue">
                        {{ data.Tel ?? $t('manage_vehicles.unassigned') }}
                    </div>
                </template>
            </Column>
            <Column
                field="Marka"
                :header="$t('data_table.header.vehicle_name')"
                style="width: 175px"
            >
                <template #body="{ data }">
                    <div @dblclick="copyValue">
                        <span>
                            {{
                                `${data.Marka} ${data.Model} ${data?.Wersja_Rocznik}`
                            }}
                        </span>
                    </div>
                </template>
            </Column>
            <Column field="Model" style="display: none" />
            <Column field="Wersja_Rocznik" style="display: none" />
            <Column
                field="Numer_rejestracyjny"
                :header="$t('data_table.header.license_plate')"
                style="width: 120px; overflow: hidden"
            >
                <template #body="{ data }">
                    <div @dblclick="copyValue">
                        {{ data.Numer_rejestracyjny }}
                    </div>
                </template>
            </Column>
            <Column
                field="VIN"
                :header="$t('data_table.header.VIN')"
                style="width: 230px; overflow: hidden"
            >
                <template #body="{ data }">
                    <div style="max-width: 200px" @dblclick="copyValue">
                        {{ data.VIN }}
                    </div>
                </template>
            </Column>
            <Column
                field="Przebieg"
                :header="$t('data_table.header.mileage')"
                style="width: 150px"
            >
                <template #body="{ data }">
                    <div @dblclick="copyValue">
                        {{ data.Przebieg ? `${data.Przebieg} km` : null }}
                    </div>
                </template>
            </Column>
            <Column
                field="Opis"
                :header="$t('data_table.header.description')"
                style="
                    max-width: 250px;
                    word-wrap: break-word;
                    overflow: hidden;
                "
            >
                <template #body="{ data }">
                    <div v-html="data.Opis"></div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputFilter from '@/components/common/InputFilter.vue'
import VehiclesTableOptions from '@/components/views/manage-vehicles/VehiclesTableOptions.vue'
import copyToClipboard from '@/components/helpers/copyToClipboard.js'

export default {
    components: {
        DataTable,
        Column,
        Button,
        InputFilter,
        VehiclesTableOptions,
    },
    props: {
        receivedVehicles: {
            type: Array,
            required: true,
        },
        isLoading: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            tableFilters: null,
        }
    },
    computed: {
        totalNumberOfVehicles: {
            get() {
                return this.$store.state.vehicles?.total
            },
        },
    },
    methods: {
        clearTableFilters() {
            this.$refs.inputFilter.clearTableFilters()
        },
        copyValue(e) {
            const text = e.target?.innerText
            copyToClipboard(text)
            this.$toast.info(
                `${this.$t('toast.info.copied_value_to_clipboard')}: ${text}`,
            )
        },
    },
}
</script>
<style lang="scss" scoped>
.vehicles-wrapper {
    display: flex;
    gap: 2rem;

    .vehicles-data-table {
        font-size: 1.6rem;
        width: 100%;

        .table-header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;

            > * {
                font-size: 1.5rem;
            }

            @media (max-width: 700px) {
                flex-direction: column;
            }
        }
    }
}
</style>
