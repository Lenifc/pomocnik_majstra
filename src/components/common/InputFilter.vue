<template>
    <div class="p-input-icon-left">
        <i class="pi pi-search" />
        <InputText
            v-model="searchValue"
            v-tooltip.bottom="$t('tooltip.type_3_characters')"
            class="input-text"
            :placeholder="$t('common.search')"
        />
    </div>
</template>
<script>
import { FilterMatchMode } from 'primevue/api'
import InputText from 'primevue/inputtext'

export default {
    name: 'InputFilter',
    components: {
        InputText,
    },
    emits: ['update-filters'],
    data() {
        return {
            tableFilters: {
                global: { value: '', matchMode: FilterMatchMode.CONTAINS },
            },
            searchValue: null,
        }
    },
    watch: {
        searchValue(newVal) {
            if (newVal?.trim().length > 2) {
                this.tableFilters['global'].value = this.searchValue.trim()
            } else this.tableFilters['global'].value = ''
            this.$emit('update-filters', this.tableFilters)
        },
    },
    methods: {
        clearTableFilters() {
            // this.tableFilters['global'].value = ''
            this.searchValue = null
        },
    },
}
</script>
<style lang="scss" scoped>
.input-text {
    font-size: 1.6rem;
}
</style>
