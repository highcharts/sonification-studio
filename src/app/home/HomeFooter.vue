<template>
    <footer>
        <div class="footer-content">
            <div class="center">
                <div class="apptitle">
                    Highcharts Sonification Studio
                </div>
                <div class="copyright">
                    © {{ year }} Highsoft AS. All rights reserved.
                </div>
            </div>
            <ul class="footer-list-links">
                <li><a href="https://www.highcharts.com/about">Our team</a></li>
                <li><a href="https://www.highcharts.com/contact">Contact us</a></li>
                <li><a href="https://www.highcharts.com/article/accessibility-statement">Accessibility</a></li>
                <li><a href="https://www.highcharts.com/blog/">Blog</a></li>
                <li><a href="https://www.highcharts.com/newsletter/">Newsletter</a></li>
            </ul>
            <ul class="footer-list-socials">
                <li>
                    <a
                        href="https://www.facebook.com/Highcharts"
                        aria-label="Facebook - Highcharts"
                    >
                        <img
                            :src="fbIcon"
                            alt=""
                        >
                    </a>
                </li>
                <li>
                    <a
                        href="https://twitter.com/Highcharts"
                        aria-label="Twitter - Highcharts"
                    >
                        <img
                            :src="twIcon"
                            alt=""
                        >
                    </a>
                </li>
                <li>
                    <a
                        href="https://www.linkedin.com/company/highsoft/"
                        aria-label="Linkedin - Highsoft"
                    >
                        <img
                            :src="lnIcon"
                            alt=""
                        >
                    </a>
                </li>
                <li>
                    <a
                        href="https://github.com/highcharts/highcharts"
                        aria-label="GitHub - Highcharts"
                    >
                        <img
                            :src="ghIcon"
                            alt=""
                        >
                    </a>
                </li>
                <li>
                    <a
                        href="https://www.youtube.com/channel/UCzxXofPTQ0DoT7uIy3Fxw7A"
                        aria-label="YouTube - Highcharts"
                    >
                        <img
                            :src="ytIcon"
                            alt=""
                        >
                    </a>
                </li>
                <li>
                    <a
                        href="https://www.instagram.com/highcharts"
                        aria-label="Instagram - Highcharts"
                    >
                        <img
                            :src="instIcon"
                            alt=""
                        >
                    </a>
                </li>
            </ul>
        </div>
    </footer>
</template>

<script lang="ts">
import fbIcon from './facebook-brands.svg';
import ghIcon from './github-brands.svg';
import instIcon from './instagram-brands.svg';
import lnIcon from './linkedin-in-brands.svg';
import twIcon from './twitter-brands.svg';
import ytIcon from './youtube-brands.svg';

export default {
    data() {
        return { fbIcon, ghIcon, instIcon, lnIcon, twIcon, ytIcon };
    },
    computed: {
        year: () => new Date().getFullYear()
    }
};
</script>

<style lang="less" scoped>
    footer {
        background-color: #47475c;
        width: 100%;
        box-sizing: border-box;
        padding: 20px;
        color: #ffffff;
    }

    .footer-content {
        max-width: 90rem;
        margin: 0 auto;
        display: grid;
        justify-items: stretch;
        align-items: center;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 100%;
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
    }

    .center {
        grid-column: 2;
        grid-row: 1;
        text-align: center;
        margin: 0 20px;
    }

    .copyright {
        margin-top: 10px;
        color: #aeadbd;
        font-size: 0.7em;
    }

    .footer-list-links {
        grid-column: 1;
        grid-row: 1;
        line-height: 1.5rem;
        a {
            color: #eeeeee;
            font-size: 0.9rem;
            font-weight: 300;
            text-decoration: none;
            border-left: 1px solid transparent;
            padding-left: 5px;
            &:hover {
                border-left: 1px solid #eeeeee;
                color: #ffffff;
            }
        }
    }

    .footer-list-socials {
        grid-column: 3;
        grid-row: 1;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        flex-wrap: wrap;
        li {
            display: block;
            margin: 0 5px;
        }
        img {
            width: 36px;
            height: 36px;
        }
        a {
            transition: opacity 0.15s;
            opacity: 0.75;
            &:hover {
                opacity: 1;
                border-bottom: 1px solid #eeeeee;
            }
        }
    }

     @media (max-width: 75em) {
        .footer-list-socials {
            img {
                width: 28px;
                height: 28px;
            }
        }
    }

    @media (max-width: 55em) {
        .footer-content {
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        }
        .footer-list-socials {
            grid-column: 5;
        }
        .center {
            grid-column: 2 / span 3;
        }
    }

    @media (max-width: 36em) {
        .footer-content {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            grid-gap: 20px;
            row-gap: 20px;
        }
        .center {
            grid-column: 1;
            grid-row: 1;
        }
        .footer-list-links {
            grid-column: 1;
            grid-row: 2;
            text-align: center;
        }
        .footer-list-socials {
            grid-column: 1;
            grid-row: 3;
            justify-content: center;
            img {
                width: 22px;
                height: 22px;
            }
        }
    }
</style>
