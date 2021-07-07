<template>
    <nav>
        <ul>
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
                    <a
                        href="#"
                        @click="navigate"
                        @keydown.space="navigate"
                    >
                        <img
                            class="back-icon"
                            alt=""
                            :src="backIcon"
                        >
                        <span class="underline">
                            Back
                        </span>
                    </a>
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
import { keyPressed, Keys, Modifiers } from '../core/utils/keyboardUtils';
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
    watch: {
        helpVisible(val) {
            if (!val) {
                (this.$refs as any).helpDialog.unhideOthersFromAT();
            } else {
                (this.$refs as any).helpDialog.hideOthersFromAT();
            }
        }
    },
    mounted() {
        document.addEventListener('keydown', e => {
            if (keyPressed(Keys.Esc, Modifiers.None, e) && this.helpVisible) {
                this.hideHelpDialog();
            }
        });
    },
    methods: {
        hideHelpDialog() {
            this.helpVisible = false;
            this.$nextTick(() => setTimeout(
                () => (this.$refs['helpBtn'] as HTMLButtonElement).focus(),
                20
            ));
        },
        onHelpClick() {
            this.helpVisible = !this.helpVisible;
            if (this.helpVisible) {
                this.$nextTick(() => setTimeout(
                    () => (this.$refs.helpDialog as any).$el.focus(),
                    20
                ));
            } else {
                this.hideHelpDialog();
            }
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

    .back-icon {
        width: 18px;
        height: 18px;
        margin-top: -2px;
        margin-right: -3px;
        vertical-align: middle;
    }

    .header-back {
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
            img {
                filter: sepia() hue-rotate(130deg) brightness(90%);
            }
            .underline {
                text-decoration: underline;
            }
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
