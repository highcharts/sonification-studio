<template>
    <div class="page-container">
        <Header />
        <main>
            <div class="main-content">
                <slot />
            </div>
        </main>
        <div class="spacer" />
        <Footer />
    </div>
</template>

<script lang="ts">
import Header from './Header.vue';
import Footer from './Footer.vue';

export default {
    components: {
        Header, Footer
    }
};
</script>

<style lang="less">
    .page-container {
        min-width: 320px;
        font-family: 'Roboto', sans-serif;
        display: flex;
        flex-direction: column;
        min-height: 100%;
        background-color: #fff;
        main {
            padding: 20px 40px;
            width: 100%;
            box-sizing: border-box;
        }

        h1 {
            margin-top: 20px;
            color: #25386f;
            font-size: 3rem;
            font-weight: 700;
            width: 100%;
            text-align: center;
        }

        @media (min-width: 48em) and (max-width: 60em) {
            h1 {
                margin-top: 0;
            }
            main {
                padding: 20px 35px;
            }
        }

        @media (max-width: 47.99em) {
            h1 {
                font-size: 2.5rem;
            }
            main {
                padding: 20px 25px;
            }
        }

        @media (max-width: 30em) {
            h1 {
                font-size: 2rem;
            }
            main {
                padding: 20px 20px;
            }
        }
    }

    .spacer {
        flex: 1;
    }

    .main-content {
        max-width: 80rem;
        margin: 0 auto 80px;
        width: 100%;
        .section {
            margin: 30px auto;
            max-width: 60rem;
            box-sizing: border-box;
        }
    }

</style>
