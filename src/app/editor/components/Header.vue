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

            {{ /* Use button element because of potential vue-router issue with #-links */ }}
            <button
                role="link"
                class="skip-link sr-only"
                @click="onSkipLinkClick"
                @keydown.enter="onSkipLinkClick"
                @keydown.space="onSkipLinkClick"
            >
                Skip to content
            </button>

            <PrimaryNav
                class="primary-nav"
                @skipToContent="$emit('skipToContent')"
            />
        </div>

        <div class="nav-container">
            <h2
                id="design-stage-heading"
                class="sr-only"
            >
                Design stage
            </h2>

            <EditorNav
                labelledby="design-stage-heading"
                class="section-nav"
            />

            <h2
                id="project-tools-heading"
                class="sr-only"
            >
                Project tools
            </h2>

            {{ /* Safari list hack requires role="list" */ }}
            <ul
                role="list"
                aria-labelledby="project-tools-heading"
            >
                <li><HeaderImport class="section-import" /></li>
                <li><HeaderExport class="section-export" /></li>
            </ul>
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
    methods: {
        onSkipLinkClick(e: Event) {
            this.$emit('skipToContent');
            e.preventDefault();
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";
    @import "../sr-only";

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
        ul {
            list-style: none;
            display: flex;
        }
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

    .skip-link {
        background-color: #fff;
        padding: 10px;
        border: 1px solid @dark-blue-5;
        border-radius: 3px;
        color: #c40707;
        &:focus, &:active {
            z-index: 100;
            width: auto;
            height: auto;
            left: 8px;
            top: 8px;
            opacity: 1;
            clip: auto;
            filter: none;
        }
    }
</style>
