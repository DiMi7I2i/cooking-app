import "./style.css";
import "./flags.css";
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/aura-light-blue/theme.css';
import 'primevue/resources/primevue.min.css';

import { createApp } from 'vue';
import { createRouter } from 'vue-router';

import App from './App.vue';
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Sidebar from 'primevue/sidebar';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Avatar from 'primevue/avatar'
import AutoComplete from 'primevue/autocomplete'

import StyleClass from 'primevue/styleclass';
import Ripple from 'primevue/ripple';

import DataView from 'primevue/dataview';
import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions'   // optional
import { createWebHistory } from "vue-router";

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
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});



const app = createApp(App);
app.use(PrimeVue);
app.use(ToastService);
app.use(router);

app.directive('styleclass', StyleClass);
app.directive('ripple', Ripple);

app.component('Button', Button);
app.component('InputText', InputText);
app.component('Toast', Toast);
app.component('Sidebar', Sidebar);
app.component('Avatar', Avatar);
app.component('AutoComplete', AutoComplete);
app.component('DataView', DataView);
app.component('DataViewLayoutOptions', DataViewLayoutOptions);


app.mount('#app');
