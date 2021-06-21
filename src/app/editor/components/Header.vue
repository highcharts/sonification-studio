<template>
    <header>
        <div class="heading-row">
            <div class="logo-container">
                <a href="https://sonification.highcharts.com">
                    <img
                        alt="Highcharts sonification homepage"
                        :src="highchartsIcon"
                    >
                </a>
                <h1
                    id="initialFocusElement"
                    tabindex="-1"
                >
                    Highcharts Sonification Studio
                </h1>
            </div>

            <PrimaryNav
                class="primary-nav"
                @skipToContent="$emit('skipToContent')"
            />
        </div>

        <div class="nav-container">
            <EditorNav class="section-nav" />
            <HeaderImport class="section-import" />
            <HeaderExport class="section-export" />
        </div>
    </header>
</template>

<script lang="ts">
import highchartsIcon from '../assets/highcharts-logo.svg';
import EditorNav from './EditorNav.vue';
import PrimaryNav from './PrimaryNav.vue';
import HeaderImport from './HeaderImport.vue';
import HeaderExport from './HeaderExport.vue';

export default {
    components: {
        EditorNav,
        PrimaryNav,
        HeaderImport,
        HeaderExport
    },
    data() {
        return { highchartsIcon };
    },
};
</script>

<style lang="less" scoped>
    @import "../colors";

    header {
        display: flex;
        flex-direction: column;
    }

    h1 {
        font-size: 0.8125rem;
        font-weight: normal;
        letter-spacing: 0.1em;
    }

    .primary-nav {
        flex: 1;
    }

    .heading-row {
        display: flex;
        width: 100%;
        box-sizing: border-box;
        align-items: center;
        justify-content: space-between;
        background-color: #47475c;
        border-bottom: 1px solid @dark-blue-5;
        color: #D9D9D9;
        padding: 5px 10px;
        margin-bottom: 5px;
        border-bottom: 1px solid @dark-blue-5;
    }

    .nav-container {
        width: 100%;
        display: flex;
        box-sizing: border-box;
        padding-left: 10px;
        padding-right: 10px;
    }

    .logo-container {
        flex: 1;
        margin-top: 5px;
        img {
            width: 1rem;
            height: $width;
            margin: 0 8px 0px;
        }
        a {
            float: left;
        }
    }
</style>
