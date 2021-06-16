<template>
    <header>
        <div class="heading-row">
            <a href="https://sonification.highcharts.com">
                <img
                    alt="Highcharts sonification homepage"
                    :src="highchartsIcon"
                >
            </a>
            <h1>Highcharts Sonification Studio</h1>
        </div>
        <div class="nav-row">
            <HeaderNav class="section-nav" />
            <HeaderImport class="section-import" />
            <HeaderExport class="section-export" />
        </div>
    </header>
</template>

<script lang="ts">
import highchartsIcon from '../assets/highcharts-logo.svg';
import HeaderNav from './HeaderNav.vue';
import HeaderImport from './HeaderImport.vue';
import HeaderExport from './HeaderExport.vue';

export default {
    components: {
        HeaderNav,
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
        img {
            width: 16px;
            height: $width;
            margin: 0 8px -2px;
        }
        a {
            float: left;
        }
    }
    h1 {
        font-size: 13px;
        font-weight: normal;
        letter-spacing: 0.1em;
    }
    .heading-row {
        display: flex;
        align-items: center;
        background-color: #47475c;
        border-bottom: 1px solid @dark-blue-5;
        color: #D9D9D9;
        padding: 5px 10px;
        margin-bottom: 5px;
        border-bottom: 1px solid @dark-blue-5;
    }
    .nav-row {
        width: 100%;
        display: flex;
        box-sizing: border-box;
        padding-left: 10px;
        padding-right: 10px;
    }
</style>
