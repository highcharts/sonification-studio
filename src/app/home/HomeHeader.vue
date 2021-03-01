<template>
    <header>
        <div class="header-content">
            <a
                class="highcharts-logo"
                href="https://www.highcharts.com"
            >
                <img
                    alt="Highcharts.com logo"
                    :src="highchartsLogo"
                >
            </a>
            <div class="collab-region">
                <div class="collab-text">
                    designed in collaboration with
                </div>
                <a
                    class="gt-logo"
                    href="https://www.gatech.edu"
                >
                    <img
                        alt="Georgia Institute of Technology logo"
                        :src="gtLogo"
                    >
                </a>
            </div>
        </div>
    </header>
</template>

<script lang="ts">
import highchartsLogo from './highcharts-logo.svg';
import gtLogo from './gt-logo.svg';

export default {
    data() {
        return { highchartsLogo, gtLogo };
    }
};
</script>

<style lang="less" scoped>
    header {
        background-image: url('./bg__header.svg');
        background-repeat: no-repeat;
        background-position: 50% 0;
        background-size: auto;
        background-color: transparent;
        position: relative;
        width: 100%;
        height: 11.5rem;

        img {
            width: auto;
            height: 48px;
        }
    }

    .header-content {
        box-sizing: border-box;
        max-width: 86rem;
        height: 100%;
        margin: 0 auto;
        padding: 15px 25px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .collab-region {
        margin-right: 60px;
        margin-left: 20px;
        text-align: center;
    }

    .collab-text {
        color: #ffffff;
        font-style: italic;
        font-size: 0.8em;
        margin-bottom: 5px;
    }

    @media (max-width: 78em) {
        .collab-region {
            margin-right: 30px;
            text-align: right;
        }
    }

    @media (max-width: 30em) {
        header {
            height: 7rem !important;
        }
    }

    @media (max-width: 48em) {
        header {
            height: 5.5rem;
            background-image: none;
            background-color: #484859;
            img {
                height: 34px;
            }
            .collab-region {
                margin-right: 0;
            }
            .collab-text {
                font-size: 0.7em;
            }
        }
        .header-content {
            padding: 15px;
            align-items: center;
        }
    }

    @media (min-width: 48em) and (max-width: 63.9375em) {
        header {
            background-size: auto 250px;
            height: 15rem;
        }
        .header-content {
            padding: 20px;
        }
        .collab-region {
            margin-right: 10px;
        }
    }

    @media (min-width: 64em) and (max-width: 74.9375em) {
        header {
            background-size: auto 250px;
            background-position: 44% 0;
            height: 15rem;
        }
        .header-content {
            padding: 20px;
        }
        .collab-region {
            margin-right: 10px;
        }
    }
</style>
