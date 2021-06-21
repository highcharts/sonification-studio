<template>
    <nav aria-label="Primary">
        <ul>
            <li>
                {{ /* Use button element because of potential vue-router issue with #-links */ }}
                <button
                    role="link"
                    class="skip-link"
                    @click="onSkipLinkClick"
                    @keydown.enter="onSkipLinkClick"
                    @keydown.space="onSkipLinkClick"
                >
                    Skip to content
                </button>
            </li>

            <li>
                <button
                    ref="helpBtn"
                    class="help-btn"
                    :aria-expanded="helpVisible"
                    @click="onHelpClick"
                >
                    Help
                </button>
                <SEModalInfo
                    v-show="helpVisible"
                    ref="helpDialog"
                    dialog-title="Help"
                    @close="hideHelpDialog"
                >
                    <HelpContent />
                </SEModalInfo>
            </li>

            <li>
                <router-link
                    v-slot="{ navigate }"
                    class="header-back"
                    to="/"
                    custom
                >
                    <div
                        class="header-back-container"
                        @click="navigate"
                    >
                        <img
                            class="back-icon"
                            alt=""
                            :src="backIcon"
                        >
                        <a
                            id="back-link-a"
                            href="#"
                            @click="navigate"
                            @keydown.space="navigate"
                        >
                            Back
                        </a>
                    </div>
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
import HelpContent from './HelpContent.vue';
import SEModalInfo from './basic/SEModalInfo.vue';
import backIcon from '../assets/angle-left-solid.svg';

export default {
    components: {
        HelpContent, SEModalInfo
    },
    data() {
        return {
            backIcon,
            helpVisible: false
        };
    },
    mounted() {
        document.addEventListener('keydown', e => {
            const keyCode = e.which || e.keyCode;
            if (keyCode === 27 && this.helpVisible) { // esc
                this.hideHelpDialog();
            }
        });
    },
    methods: {
        hideHelpDialog() {
            this.helpVisible = false;
            this.$nextTick(() => (this.$refs['helpBtn'] as HTMLButtonElement).focus());
        },
        onHelpClick() {
            this.helpVisible = !this.helpVisible;
            if (this.helpVisible) {
                this.$nextTick(() => (this.$refs.helpDialog as any).$el.focus());
            } else {
                this.hideHelpDialog();
            }
        },
        onSkipLinkClick(e: Event) {
            this.$emit('skipToContent');
            e.preventDefault();
        }
    }
};
</script>

<style lang="less" scoped>
    @import "../colors";

    nav ul {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        list-style: none;
    }

    .skip-link {
        position: absolute;
        opacity: 0.000001;
        z-index: -99;
        width: 1px;
        height: 1px;
        filter: alpha(opacity=1);
        overflow: hidden;
        white-space: nowrap;
        clip: rect(1px, 1px, 1px, 1px);
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

    .back-icon {
        width: 18px;
        height: 18px;
        margin-top: 0;
        margin-right: -3px;
        vertical-align: middle;
    }

    .header-back-container {
        cursor: pointer;
        &:hover {
            img {
                filter: sepia() hue-rotate(130deg) brightness(90%);
            }
            #back-link-a {
                text-decoration: underline;
                color: #e4f4ff;
            }
        }
    }

    .header-back a {
        padding: 0;
        font: inherit;
        font-size: 0.875rem;
        line-height: 24px;
        font-weight: normal;
        vertical-align: middle;
        text-decoration: none;
        color: white;
        border: 0;
        &:visited {
            color: white;
        }
        &:hover {
            color: #e4f4ff;
        }
        &:active {
            color: #ccccf1;
        }
    }

    .help-btn {
        border: 0;
        border-right: 1px solid #656985;
        line-height: 24px;
        background-color: transparent;
        margin: 0;
        margin-right: 8px;
        padding: 0;
        padding-right: 12px;
        color: white;
        font: inherit;
        font-size: 0.875rem;
        font-weight: normal;
        cursor: pointer;
        display: block;
        &:hover {
            color: #e4f4ff;
            text-decoration: underline;
        }
        &:active {
            color: #ccccf1;
        }
    }

    button::-moz-focus-inner {
        border: 0;
    }

</style>
