<template>
    <Page>
        <h1>How to use</h1>
        <nav>
            <router-link to="/">
                Home
            </router-link>
            <router-link to="/app">
                Editor
            </router-link>
        </nav>

        <p class="intro-text">
            Get started using the Highcharts Sonification Studio to create charts and sonifications.
        </p>

        <SEAccordionContainer>
            <SEAccordionItem
                heading="Import your data"
                controls="tutorial-import"
            >
                <keep-alive>
                    <TutorialImport id="tutorial-import" />
                </keep-alive>
            </SEAccordionItem>
            <SEAccordionItem
                heading="Export the result"
                controls="tutorial-export"
            >
                <keep-alive>
                    <TutorialExport id="tutorial-export" />
                </keep-alive>
            </SEAccordionItem>
        </SEAccordionContainer>
    </Page>
</template>

<script lang="ts">
import Page from './Page.vue';
import SEAccordionItem from '../editor/components/basic/SEAccordionItem.vue';
import SEAccordionContainer from '../editor/components/basic/SEAccordionContainer.vue';
import TutorialExport from './TutorialExport.vue';
import TutorialImport from './TutorialImport.vue';

export default {
    components: {
        Page, SEAccordionItem, SEAccordionContainer, TutorialExport, TutorialImport
    }
};
</script>

<style lang="less" scoped>
    nav {
        display: flex;
        justify-content: flex-end;
        a {
            display: block;
            margin-left: 10px;
        }
    }

    .intro-text {
        font-size: 1.5rem;
        margin-bottom: 20px;
    }

</style>
