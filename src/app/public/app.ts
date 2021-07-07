import Vue from 'vue';
import VueRouter from 'vue-router';
import Editor from '../editor/Editor.vue';
import Home from '../home/Home.vue';
import App from '../App.vue';
import { removeFocusOutlineUnlessKeypress } from '../editor/core/utils/removeFocusOutline';
import Announcer from '../editor/core/utils/Announcer';
const routeAnnouncer = new Announcer();

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [{
        path: '/',
        component: Home,
        meta: { title: 'Home | Highcharts Sonification Studio' }
    }, {
        path: '/app',
        component: Editor,
        meta: { title: 'Editor | Highcharts Sonification Studio' }
    }]
});

new Vue({
    el: '#app',
    router,
    watch: {
        $route: function(to) {
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
    render: h => h(App)
});
