<template>
    <Page>
        <div class="content section">
            <h1>How to use</h1>
            <nav aria-label="You are here">
                <a href="https://www.highcharts.com">Home</a> <span>/</span>
                <router-link to="/">
                    Sonification Studio
                </router-link><span>/</span><span aria-current="page">Tutorial</span>
            </nav>

            <p class="intro-text">
                Get started using the Highcharts Sonification Studio to create charts and sonifications.
            </p>

            <div class="accordion-section">
                <button
                    id="expandAll"
                    :aria-expanded="!isAnyCollapsed ? 'true' : 'false'"
                    @click="expandAll"
                >
                    <img
                        alt=""
                        :src="arrowIcon"
                    > Expand all
                </button>

                <SEAccordionContainer>
                    <SEAccordionItem
                        v-for="item in accordionItems"
                        :key="item.component"
                        ref="accordionComponents"
                        :heading="item.heading"
                        :controls="item.component"
                        :heading-level="2"
                        @click="updateIsCollapsed"
                    >
                        <keep-alive>
                            <component
                                :is="item.component"
                                :id="item.component"
                                class="tutorial-accordion-content"
                            />
                        </keep-alive>
                    </SEAccordionItem>
                </SEAccordionContainer>
            </div>
        </div>
    </Page>
</template>

<script lang="ts">
import Page from './Page.vue';
import SEAccordionItem from '../editor/components/basic/SEAccordionItem.vue';
import SEAccordionContainer from '../editor/components/basic/SEAccordionContainer.vue';
import TutorialExport from './TutorialExport.vue';
import TutorialImport from './TutorialImport.vue';
import arrowIcon from '../editor/assets/arrow-down.svg';

export default {
    components: {
        Page, SEAccordionItem, SEAccordionContainer, TutorialExport, TutorialImport
    },
    data() {
        return {
            isAnyCollapsed: true,
            accordionItems: [{
                component: 'TutorialImport',
                heading: 'Import your data'
            }, {
                component: 'TutorialExport',
                heading: 'Export your data'
            }],
            arrowIcon
        };
    },
    methods: {
        expandAll() {
            (this.$refs.accordionComponents as Array<any>).forEach(
                c => this.isAnyCollapsed ? c.expand() : c.collapse());
            this.isAnyCollapsed = !this.isAnyCollapsed;
        },
        updateIsCollapsed() {
            this.isAnyCollapsed = (this.$refs.accordionComponents as Array<any>).some(c => !c.isExpanded());
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../editor/colors";

    .content.section {
        margin-top: 0;
    }

    .accordion-section {
        max-width: 50rem;
        margin: 0 auto;
    }

    nav {
        margin-top: 5px;
        display: flex;
        justify-content: flex-end;
        gap: 7px;
        a {
            color: #1673B1;
        }
    }

    @media screen and (max-width: 900px) {
        nav {
            justify-content: center;
        }
    }

    .intro-text {
        font-size: 1.2rem;
        margin: 20px 0;
    }

    .tutorial-accordion-content {
        font-size: 0.6rem;
    }

    #expandAll {
        background: none;
        font-size: 1rem;
        background-color: @seaccordionitem-bg;
        border: 1px solid @purple-9;
        padding: 5px 8px;
        text-align: right;
        margin-bottom: 5px;
        margin-left: auto;
        display: block;
        color: @seaccordionitem-color;
        cursor: pointer;
        img {
            width: 16px;
            height: $width;
        }
        &:hover {
            background-color: @purple-9;
            color: @seaccordionitem-hover-color;
        }
    }
</style>
