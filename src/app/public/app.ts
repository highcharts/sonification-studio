import { createApp, defineComponent, h, markRaw } from 'vue';
import { createRouter, createWebHashHistory, RouteLocationNormalized } from 'vue-router';
import { createPinia } from 'pinia';
import Editor from '../editor/Editor.vue';
import Home from '../home/Home.vue';
import Tutorial from '../home/Tutorial.vue';
import App from '../App.vue';
import Highcharts from '../editor/core/highchartsSetup';
import { ChartBridge } from '../editor/core/ChartBridge';
import { startLocalStoragePersistence } from '../editor/store/store';
import { removeFocusOutlineUnlessKeypress } from '../editor/core/utils/removeFocusOutline';
import Announcer from '../editor/core/utils/Announcer';
const routeAnnouncer = new Announcer();

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        path: '/',
        component: Home,
        meta: { title: 'Home | Highcharts Sonification Studio' }
    }, {
        path: '/app',
        component: Editor,
        meta: { title: 'Editor | Highcharts Sonification Studio' }
    }, {
        path: '/tutorial',
        component: Tutorial,
        meta: { title: 'Tutorial | Highcharts Sonification Studio' }
    }]
});

const app = createApp(defineComponent({
    watch: {
        $route: function(to: RouteLocationNormalized) {
            document.body.setAttribute('aria-busy', 'true');
            this.$nextTick(() => {
                const title = to.meta.title;
                document.title = title;
                document.body.setAttribute('aria-busy', 'false');

                if (window) {
                    window.scrollTo(0, 0);
                }

                // Additional timeouts required on Chrome with VoiceOver for the announcement and focus to work.
                setTimeout(() => {
                    const focusElement = document.getElementById('initialFocusElement');
                    if (focusElement) {
                        focusElement.focus();
                    } else {
                        console.error('No element receiving initial focus on page "' + title + '".');
                    }

                    setTimeout(() => routeAnnouncer.announce(title + ' loaded'), 300);
                }, 100);
            });
        }
    },
    mounted() {
        document.body.setAttribute('aria-busy', 'false');
        removeFocusOutlineUnlessKeypress();
        const routeAnnouncerEl = document.getElementById('routeAnnouncer');
        if (routeAnnouncerEl) {
            routeAnnouncer.init(routeAnnouncerEl);
        } else {
            console.error('No element available for routing announcements.');
        }
    },
    render: () => h(App)
}));

// The editor's stores. Code outside components is handed this instance.
const pinia = createPinia();
app.use(pinia);
startLocalStoragePersistence(pinia);

// Editor-wide singletons, available in all components as this.$chartBridge
// and this.$announcer (typed in src/env.d.ts).
const chartBridge = new ChartBridge(pinia, Highcharts);
const announcer = new Announcer();
chartBridge.initAnnouncer(announcer);
app.config.globalProperties.$chartBridge = markRaw(chartBridge);
app.config.globalProperties.$announcer = announcer;

app.use(router);

// Resolve the initial route before mounting, so the $route watcher above only
// fires on actual navigation and not on initial page load. The first page
// still needs its title, which index.html sets to Home's.
router.isReady().then(() => {
    document.title = router.currentRoute.value.meta.title;
    app.mount('#app');
});
