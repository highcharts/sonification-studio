import Vue from 'vue';
import VueRouter from 'vue-router';
import Editor from '../editor/Editor.vue';
import Home from '../home/Home.vue';
import App from '../App.vue';

Vue.use(VueRouter);

const routes = [{
    path: '/',
    component: Home
}, {
    path: '/app',
    component: Editor
}];

const router = new VueRouter({
    routes
});

new Vue({
    el: '#app',
    router,
    render: h => h(App)
});
