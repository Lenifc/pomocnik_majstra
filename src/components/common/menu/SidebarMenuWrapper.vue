<template>
    <SidebarMenu
        :menu="menu"
        width="fit-content"
        :collapsed="isMenuCollapsed || false"
        @item-click="onItemClick"
    />
</template>
<script>
import { SidebarMenu } from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import CustomDivider from '@/components/common/CustomDivider.vue'
import { markRaw } from 'vue'

import ROUTES from '@/router/routes'
import { signOut } from '@/components/helpers/auth.js'

export default {
    name: 'SidebarMenuWrapper',
    components: {
        SidebarMenu,
    },
    data() {
        return {
            isMenuCollapsed: false,
            CustomDivider: markRaw(CustomDivider),
            menu: [
                {
                    header: this.$t('sidebar_menu.header.workshop'),
                    hiddenOnCollapse: true,
                },
                {
                    href: ROUTES.DASHBOARD,
                    title: this.$t('sidebar_menu.dashboard'),
                    icon: 'fa fa-desktop',
                },
                {
                    href: ROUTES.MANAGE_CLIENTS,
                    title: this.$t('sidebar_menu.manage_clients'),
                    icon: 'fa fa-user',
                },
                {
                    href: ROUTES.MANAGE_VEHICLES,
                    title: this.$t('sidebar_menu.manage_vehicles'),
                    icon: 'fa fa-car',
                },
                {
                    component: CustomDivider,
                },
                {
                    header: this.$t('sidebar_menu.header.tasks'),
                    hiddenOnCollapse: true,
                },
                {
                    href: ROUTES.TASKS_ADD,
                    title: this.$t('sidebar_menu.add_task'),
                    icon: 'fa fa-plus',
                },
                {
                    href: ROUTES.TASKS_NEW,
                    title: this.$t('sidebar_menu.new_tasks'),
                    icon: 'fa fa-parking',
                },
                {
                    href: ROUTES.TASKS_IN_PROGRESS,
                    title: this.$t('sidebar_menu.tasks_in_progress'),
                    icon: 'fa fa-tasks',
                },
                {
                    href: ROUTES.TASKS_DONE,
                    title: this.$t('sidebar_menu.tasks_done'),
                    icon: 'fa fa-check',
                },
                {
                    component: CustomDivider,
                },
                {
                    href: ROUTES.SEARCH,
                    title: this.$t('sidebar_menu.search'),
                    icon: 'fa fa-search',
                },
                {
                    component: CustomDivider,
                },
                {
                    header: this.$t('sidebar_menu.header.settings'),
                    hiddenOnCollapse: true,
                },
                // {
                //     title: 'Kategorie i ceny',
                //     icon: 'fa fa-tools',
                //     disabled: true,
                // },
                // {
                //     href: '/dane-warsztatu',
                //     title: 'Dane warsztatu',
                //     icon: 'fas fa-file-invoice-dollar',
                // },
                {
                    href: ROUTES.SETTINGS,
                    title: this.$t('sidebar_menu.settings'),
                    icon: 'fas fa-cogs',
                },
                {
                    component: CustomDivider,
                },
                {
                    icon: 'fa fa-power-off',
                    title: this.$t('sidebar_menu.logout'),
                    class: 'logout',
                },
            ],
        }
    },
    mounted() {
        if (localStorage.getItem('menuCollapsed'))
            this.menuCollapsed = JSON.parse(
                localStorage.getItem('menuCollapsed'),
            )
    },
    methods: {
        onItemClick(e) {
            if (e.currentTarget.classList.contains('logout')) {
                this.logOutFromAccount()
            }
        },
        async logOutFromAccount() {
            try {
                this.$toast.info(this.$t('toast.info.logged_out'))
                await signOut()
                this.$store.commit('signOut')
                this.$router.push(ROUTES.MAIN_SCREEN)
            } catch (error) {
                this.$toast.error(error.message)
            }
        },
    },
}
</script>
<style>
.v-sidebar-menu .vsm--link_active {
    background-color: black !important;
    box-shadow: inset 3px 0 0 0 var(--active-tab-menu) !important;
}

@media (max-width: 600px) {
    .v-sidebar-menu .vsm--link {
        padding-left: 8px;
        font-size: 15px;
    }
    .v-sidebar-menu.vsm_expanded,
    .v-sidebar-menu.vsm_extended .vsm--link_active {
        width: 210px;
    }
    .v-sidebar-menu.vsm_collapsed,
    .v-sidebar-menu.vsm_collapsed .vsm--link_active {
        width: 52px;
    }
}
</style>
