<template>
    <div class="audio-global-contexts-container">
        <div
            v-for="context in contexts"
            :key="context.id"
            class="context-card"
        >
            <div class="context-header">
                <h6>
                    Context cue {{ context.id }}
                </h6>
                <button
                    class="remove-btn"
                    aria-label="Remove context"
                    @click="onRemoveContext(context.id)"
                >
                    <img
                        alt=""
                        :src="removeIcon"
                    >
                </button>
            </div>

            <div class="context-conditions">
                Play every <input
                    v-model="context.valueInterval"
                    type="number"
                    aria-label="Context interval"
                    :min="0"
                > {{ xAxisIsDate ? context.valueMultiplierName || 'milliseconds' : 'X-values' }},
                when
                <select
                    v-show="variableValueProp"
                    v-model="context.valueProp"
                    aria-label="Value property"
                >
                    <option
                        v-for="valueProp in valueProps"
                        :key="valueProp"
                        :value="valueProp"
                    >
                        {{ valueProp }}
                    </option>
                </select>
                <span
                    v-show="!variableValueProp"
                >
                    X
                </span> is
                <SEControl
                    helpfor="Play when"
                    helptext="When this context cue should be playing."
                    :horizontal="true"
                    :compact-content="true"
                >
                    <select
                        id="playwhen-select"
                        v-model="context.playWhenType"
                        aria-label="Play when"
                    >
                        <option
                            v-for="playWhenType in playWhenTypes"
                            :key="playWhenType"
                            :value="playWhenType"
                        >
                            {{ playWhenType }}
                        </option>
                    </select>
                </SEControl>

                <SEControl
                    v-show="context.playWhenType.startsWith('crossing')"
                    v-slot="slotProps"
                    label="Threshold"
                    helptext="The context will play only when the value crosses this threshold."
                    :horizontal-reverse="true"
                    :expand-content="true"
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="context.playWhenThreshold"
                        :labelledby="slotProps.labelId"
                        :min="context.valueProp === 'x' ? xRange.min : yRange.min"
                        :max="context.valueProp === 'x' ? xRange.max : yRange.max"
                        :step="context.valueProp === 'x' ? xStep : yStep"
                    />
                </SEControl>

                <SEControl
                    v-show="context.playWhenType === 'between'"
                    v-slot="slotProps"
                    label="Min"
                    helptext="The context will play only when the value is greater than or equal to this."
                    :horizontal-reverse="true"
                    :expand-content="true"
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="context.playWhenMin"
                        :labelledby="slotProps.labelId"
                        :min="context.valueProp === 'x' ? xRange.min : yRange.min"
                        :max="context.valueProp === 'x' ? xRange.max : yRange.max"
                        :step="context.valueProp === 'x' ? xStep : yStep"
                    />
                </SEControl>

                <SEControl
                    v-show="context.playWhenType === 'between'"
                    v-slot="slotProps"
                    label="Max"
                    helptext="The context will play only when the value is less than or equal to this."
                    :horizontal-reverse="true"
                    :expand-content="true"
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="context.playWhenMax"
                        :labelledby="slotProps.labelId"
                        :min="context.valueProp === 'x' ? xRange.min : yRange.min"
                        :max="context.valueProp === 'x' ? xRange.max : yRange.max"
                        :step="context.valueProp === 'x' ? xStep : yStep"
                    />
                </SEControl>
            </div>

            <button
                :aria-expanded="context.showDetails"
                class="details-btn"
                @click="context.showDetails = !context.showDetails"
            >
                <img
                    alt=""
                    :src="arrowDownIcon"
                >Details
            </button>

            <div
                v-show="context.showDetails"
                class="details"
            >
                <SEControl
                    v-slot="slotProps"
                    label="Instrument"
                    helptext="The type of instrument to use for playing this context track."
                    :horizontal-reverse="true"
                    :expand-content="true"
                >
                    <SEDropdown
                        :id="slotProps.controlId"
                        v-model="context.instrument"
                        :options="instruments"
                        @input="onInstrumentChange(context)"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    label="Volume"
                    helptext="The volume for the context."
                    :horizontal-reverse="true"
                    :expand-content="true"
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="context.volume"
                        :labelledby="slotProps.labelId"
                    />
                </SEControl>
                <fieldset>
                    <legend>Pitch</legend>
                    <SEControl
                        v-slot="slotProps"
                        label="Type"
                        helptext="If set to fixed, you specify a note value directly. If mapped, you specify the Y value you want to play. Be aware that the mapping for the Y axis will go from default minimum to default maximum note."
                        :horizontal-reverse="true"
                    >
                        <SERadioGroup
                            :id="slotProps.controlId"
                            v-model="context.pitchType"
                            :options="pitchTypeOptions"
                        />
                    </SEControl>
                    <SEControl
                        v-show="context.pitchType === 'fixed'"
                        v-slot="slotProps"
                        label="Note"
                        helptext="The note to play for the context."
                        :horizontal-reverse="true"
                        :expand-content="true"
                    >
                        <SESlider
                            :id="slotProps.controlId"
                            v-model.number="context.pitchNote"
                            :labelledby="slotProps.labelId"
                            :max="110"
                            :min="0"
                        />
                    </SEControl>
                    <SEControl
                        v-show="context.pitchType !== 'fixed'"
                        v-slot="slotProps"
                        label="Y value"
                        helptext="The value to map to the note."
                        :horizontal-reverse="true"
                        :expand-content="true"
                    >
                        <SESlider
                            :id="slotProps.controlId"
                            v-model.number="context.pitchMappingValue"
                            :labelledby="slotProps.labelId"
                            :max="yRange.max"
                            :min="yRange.min"
                            :step="yStep"
                        />
                    </SEControl>
                </fieldset>
                <SEControl
                    v-slot="slotProps"
                    label="Note duration"
                    helptext="The duration of each context note, from short to long in milliseconds."
                    :horizontal-reverse="true"
                    :expand-content="true"
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="context.noteDuration"
                        :labelledby="slotProps.labelId"
                        :max="3000"
                        :min="15"
                        :step="5"
                    />
                </SEControl>
                <SEControl
                    v-slot="slotProps"
                    label="Pan"
                    helptext="Set the panning of the context note, from left (0) to right (100). Center is 50."
                    :horizontal-reverse="true"
                    :expand-content="true"
                >
                    <SESlider
                        :id="slotProps.controlId"
                        v-model.number="context.pan"
                        :labelledby="slotProps.labelId"
                    />
                </SEControl>
            </div>
        </div>

        <SEButton
            class="add-btn"
            @click="addContext"
        >
            <img
                alt=""
                :src="addIcon"
            > Add
        </SEButton>
    </div>
</template>

<script lang="ts">
import SEButton from '../basic/SEButton.vue';
import SEControl from '../basic/SEControl.vue';
import SESlider from '../basic/SESlider.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SERadioGroup from '../basic/SERadioGroup.vue';
import addIcon from '../../assets/plus-solid.svg';
import removeIcon from '../../assets/xmark-solid.svg';
import arrowDownIcon from '../../assets/arrow-down.svg';
import { mapState } from 'vuex';

// Get step value for a slider to fit range
function getSliderStep(range: number, steps: number): number {
    const step = Math.abs(range) / steps;
    if (step >= 1) {
        const pow = ('' + Math.round(step)).length - 1;
        return Math.pow(10, pow);
    } else {
        const pow = ('' + step).search(/[1-9]/) - 1;
        if (pow < 0) {
            return step;
        }
        return 1 / Math.pow(10, pow);
    }
}


export default {
    components: {
        SEButton,
        SEControl,
        SESlider,
        SEDropdown,
        SERadioGroup
    },
    props: {
        variableValueProp: { type: Boolean, required: true }
    },
    data() {
        return {
            addIcon,
            arrowDownIcon,
            removeIcon,
            valueProps: ['x', 'y'],
            playWhenTypes: ['always', 'between', 'crossing above', 'crossing below', 'never'],
            pitchTypeOptions: [{
                value: 'fixed', label: 'Fixed'
            }, {
                value: 'mappped', label: 'Mapped'
            }]
        };
    },
    computed: {
        instruments() {
            return (this as any).$chartBridge.getAvailableInstruments();
        },
        xRange() {
            return this.getPropRange('x');
        },
        yRange() {
            return this.getPropRange('y');
        },
        xStep() {
            return getSliderStep(this.xRange.max - this.xRange.min, 200);
        },
        yStep() {
            return getSliderStep(this.yRange.max - this.yRange.min, 200);
        },
        ...mapState({
            reactToDataUpdates: (state: any) => state.viewStore.reactToDataUpdates,
            contexts: (state: any) => state.globalSonifyParametersStore.contexts,
            selectedHeaderTabContent: (state: any) => state.viewStore.selectedHeaderTabContent,
            xAxisIsDate: (state: any) => state.chartParametersStore.xAxisType === 'datetime'
        })
    },
    watch: {
        contexts: {
            handler() {
                // Force update since deep changes also need to trigger.
                this.$chartBridge.forceUpdate(true);
            },
            deep: true
        }
    },
    mounted() {
        if (!this.contexts.length) {
            this.addContext(true);
        }
    },
    methods: {
        onRemoveContext(id: number) {
            this.$store.commit('globalSonifyParametersStore/removeContext', id);
        },
        addContext(inactive = false) {
            const range = this.xRange.max - this.xRange.min;
            this.$store.commit('globalSonifyParametersStore/addContext', {
                valueRange: this.xAxisIsDate ? range : null,
                inactive
            });
        },
        getPropRange(prop: string) {
            const range = (this as any).$chartBridge.reactiveGet(
                'getMinMaxValuesForProp', this.reactToDataUpdates, prop);

            // Add null checks for range and its properties
            if (!range || typeof range.max !== 'number' || typeof range.min !== 'number') {
                return { min: 0, max: 100 };
            }

            if (range.max - range.min > 1) {
                return {
                    max: Math.ceil(range.max),
                    min: Math.ceil(range.min)
                };
            }
            return range;
        },
        onInstrumentChange(context) {
            if (context.instrument && this.selectedHeaderTabContent !== 'dataContent') {
                (this as any).$chartBridge.playAudioSample(context.instrument);
            }
        },
    }
};
</script>

<style lang="less" scoped>
@import "../../colors";

.context-card {
    border: 1px solid @dark-blue-10;
    border-left: none;
    border-right: none;
    padding: 10px;
    background-color: @light-purple-8;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
}

.context-card:not(:first-child) {
    margin-top: 20px;
}

.remove-btn {
    width: 30px;
    background: none;
    border: none;
    cursor: pointer;
    img {
        width: 19px;
        height: $width;
    }
}

.add-btn {
    margin-top: 15px;
    height: 1.6rem;
    line-height: 1.2rem;
    padding: 2px 10px;
    img {
        margin-bottom: -2px;
        width: 0.8rem;
        height: $width;
    }
    &:hover {
        img {
            filter: invert();
        }
    }
}

.context-header {
    display: flex;
    justify-content: space-between;
    h6 {
        font-size: 0.9rem;
    }
    margin-bottom: 10px;
}

.se-control {
    margin-top: 5px;
}

.context-conditions {
    input {
        width: 3rem;
    }
    select {
        width: 8rem;
        margin: 10px 5px 8px 0;
        line-height: 1rem;
    }
}

fieldset {
    border: 1px solid @purple-5;
    padding: 5px;
    margin: 15px 0;
    .se-control {
        margin-top: 0;
    }
    legend {
        padding: 0 5px;
    }
}

.details-btn {
    margin-top: 10px;
    margin-bottom: 5px;
    width: 4.5rem;
    background: none;
    border: none;
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.9rem;
    img {
        width: 20px;
        height: $width;
    }
}

.details-btn:not([aria-expanded="true"]) img {
    transform: rotate(-90deg) translate(-5px, -4px);
}

.details {
    margin-top: 10px;
    border-top: 1px solid @purple-5;
    padding-top: 15px;
}
</style>
