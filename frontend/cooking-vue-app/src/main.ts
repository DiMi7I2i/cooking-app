import "./style.css";
import "./flags.css";
import 'primeicons/primeicons.css';

import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import App from './App.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Drawer from 'primevue/drawer';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Avatar from 'primevue/avatar';
import AutoComplete from 'primevue/autocomplete';
import Ripple from 'primevue/ripple';
import StyleClass from 'primevue/styleclass';
import DataView from 'primevue/dataview';
import Tag from 'primevue/tag';

import SearchRecipes from "./components/SearchRecipes.vue";
import CreateNewRecipe from "./components/CreateNewRecipe.vue";

const routes = [
    {
        path: '/',
        component: SearchRecipes,
    },
    {
        path: '/create-recipe',
        component: CreateNewRecipe,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.dark',
        }
    }
});
app.use(ToastService);
app.use(router);

app.directive('styleclass', StyleClass);
app.directive('ripple', Ripple);

app.component('Button', Button);
app.component('InputText', InputText);
app.component('Toast', Toast);
app.component('Drawer', Drawer);
app.component('Avatar', Avatar);
app.component('AutoComplete', AutoComplete);
app.component('DataView', DataView);
app.component('Tag', Tag);

app.mount('#app');
