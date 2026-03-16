<script setup lang="ts">
import { ref } from "vue";

const visible = ref(false);
</script>

<template>
        <Drawer v-model:visible="visible">
            <template #container="{ closeCallback }">
                <div class="flex flex-col h-full">
                    <div class="flex items-center justify-between px-4 pt-4 shrink-0">
                        <span class="inline-flex items-center gap-2">
                            <img src="./icons/cooking-icon-sidebar.png" width="30px" height="30px"/>
                            <span class="font-semibold text-2xl text-primary">Cooking app</span>
                        </span>
                        <span>
                            <Button type="button" @click="closeCallback" icon="pi pi-times" rounded outlined class="h-8 w-8"></Button>
                        </span>
                    </div>
                    <div class="overflow-y-auto mt-4">
                        <ul class="list-none px-4 m-0">
                            <li>
                                <div
                                    v-ripple
                                    v-styleclass="{
                                        selector: '@next',
                                        enterClass: 'hidden',
                                        enterActiveClass: 'slidedown',
                                        leaveToClass: 'hidden',
                                        leaveActiveClass: 'slideup'
                                    }"
                                    class="p-3 flex items-center justify-between text-surface-600 dark:text-surface-400 cursor-pointer rounded-md"
                                >
                                    <span class="font-medium">Gérer</span>
                                    <i class="pi pi-chevron-down"></i>
                                </div>
                                <ul class="list-none p-0 m-0 overflow-hidden">
                                    <li>
                                        <a v-ripple class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
                                            <i class="pi pi-search mr-2"></i>
                                            <span class="font-medium"><a href="/">Rechercher des recettes</a></span>
                                        </a>
                                    </li>
                                    <li>
                                        <a v-ripple class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
                                            <i class="pi pi-plus mr-2"></i>
                                            <span class="font-medium"><a href="/create-recipe">Créer une recette</a></span>
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <div class="overflow-y-auto mt-4">
                        <ul class="list-none px-4 m-0">
                            <li>
                                <div
                                    v-ripple
                                    v-styleclass="{
                                        selector: '@next',
                                        enterClass: 'hidden',
                                        enterActiveClass: 'slidedown',
                                        leaveToClass: 'hidden',
                                        leaveActiveClass: 'slideup'
                                    }"
                                    class="p-3 flex items-center justify-between text-surface-600 dark:text-surface-400 cursor-pointer rounded-md"
                                >
                                    <span class="font-medium">Catégories</span>
                                    <i class="pi pi-chevron-down"></i>
                                </div>
                                <ul class="list-none p-0 m-0 overflow-hidden">
                                    <li>
                                        <a v-ripple class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
                                            <i class="pi pi-chevron-circle-right mr-2"></i>
                                            <span class="font-medium"><a href="/">Apéritifs</a></span>
                                        </a>
                                    </li>
                                    <li>
                                        <a v-ripple class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
                                            <i class="pi pi-chevron-circle-right mr-2"></i>
                                            <span class="font-medium"><a href="/">Entrées</a></span>
                                        </a>
                                    </li>
                                    <li>
                                        <a v-ripple class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
                                            <i class="pi pi-chevron-circle-right mr-2"></i>
                                            <span class="font-medium"><a href="/">Plats</a></span>
                                        </a>
                                    </li>
                                    <li>
                                        <a v-ripple class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
                                            <i class="pi pi-chevron-circle-right mr-2"></i>
                                            <span class="font-medium"><a href="/">Desserts</a></span>
                                        </a>
                                    </li>
                                    <li>
                                        <a v-ripple class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
                                            <i class="pi pi-chevron-circle-right mr-2"></i>
                                            <span class="font-medium"><a href="/">Boissons</a></span>
                                        </a>
                                    </li>
                                    <li>
                                        <a v-ripple class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
                                            <i class="pi pi-chevron-circle-right mr-2"></i>
                                            <span class="font-medium"><a href="/">Petit-déj/brunch</a></span>
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <div class="mt-auto">
                        <hr class="mb-3 mx-3 border-t-1 border-none border-surface-200 dark:border-surface-700" />
                        <ul class="list-none p-0 m-0 overflow-hidden">
                            <li>
                                <a v-ripple class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
                                    <i class="pi pi-cog mr-2"></i>
                                    <span class="font-medium">Paramètres</span>
                                </a>
                            </li>
                        </ul>
                        <a v-ripple class="m-3 flex items-center cursor-pointer p-3 gap-2 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
                            <Avatar image="src/assets/profile-picture.png" shape="circle" />
                            <span class="font-bold">Dimitri Fernandez</span>
                        </a>
                    </div>
                </div>
            </template>
        </Drawer>
        <Button @click="visible = true">
            <i class="pi pi-bars mt-2 sidebar-button"></i>
        </Button>

</template>

<style lang="scss">

.sidebar-button {
    color: white;
    font-size: 1.5rem;
    padding-right: 10px;
    margin-left: 5px;
}

</style>

