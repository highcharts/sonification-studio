import type { Store } from 'vuex';
import type { ChartBridge } from './app/editor/core/ChartBridge';
import type Announcer from './app/editor/core/utils/Announcer';
import type { RootState } from './app/editor/store/store';

// App-wide properties available as this.$… in every component. They are
// installed in src/app/public/app.ts.
declare module 'vue' {
    interface ComponentCustomProperties {
        // Interface between the chart and the rest of the app
        $chartBridge: ChartBridge;
        // Screen reader announcements for the editor
        $announcer: Announcer;
        // Vuex 4 does not type this.$store on its own
        $store: Store<RootState>;
    }
}

declare module 'vue-router' {
    interface RouteMeta {
        // Document title, also announced to screen readers on navigation
        title: string;
    }
}
