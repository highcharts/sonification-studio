<template>
    <Page>
        <div class="tutorial-content section">
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
import TutorialImport from './TutorialImport.vue';
import TutorialConfigureChart from './TutorialConfigureChart.vue';
import TutorialConfigureAudio from './TutorialConfigureAudio.vue';
import TutorialExport from './TutorialExport.vue';
import TutorialProjects from './TutorialProjects.vue';
import arrowIcon from '../editor/assets/arrow-down.svg';

export default {
    components: {
        Page, SEAccordionItem, SEAccordionContainer, TutorialImport, TutorialConfigureChart,
        TutorialConfigureAudio, TutorialExport, TutorialProjects
    },
    data() {
        return {
            isAnyCollapsed: true,
            accordionItems: [{
                component: 'TutorialImport',
                heading: '1. Import your data'
            }, {
                component: 'TutorialConfigureChart',
                heading: '2. Configure the chart'
            }, {
                component: 'TutorialConfigureAudio',
                heading: '3. Configure the sonification'
            }, {
                component: 'TutorialExport',
                heading: '4. Export your results'
            }, {
                component: 'TutorialProjects',
                heading: '5. Manage projects'
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

<style lang="less">
    @import "../editor/colors";

    .tutorial-content.section {
        margin-top: 0;

        nav {
            margin-top: 5px;
            display: flex;
            justify-content: flex-end;
            gap: 7px;
            a {
                color: #1673B1;
            }
        }

        .intro-text {
            font-size: 1.2rem;
            margin: 20px 0;
        }

        .se-accordion-item {
            margin-top: 4px;
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
    }

    @media screen and (max-width: 900px) {
        .tutorial-content.section nav {
            justify-content: center;
        }
    }

    .tutorial-accordion-content {
        max-width: 55rem;
        margin: 0 auto;
        font-size: 1rem;
        font-family: 'Roboto', sans-serif;
        h3 {
            color: @dark-blue-5;
            margin: 20px 0 0;
            font-size: 1.5rem;
        }
        img {
            margin: 25px auto 35px;
            display: block;
            max-width: 40rem;
            max-height: 40rem;
        }
        p {
            margin-top: 10px;
        }
    }
</style>
