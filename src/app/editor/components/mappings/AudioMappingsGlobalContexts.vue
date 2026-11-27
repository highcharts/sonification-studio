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
                    :aria-label="'Remove context cue ' + context.id"
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
                    v-model="contextParameter(context, 'valueInterval').value"
                    type="number"
                    aria-label="Context interval"
                    :min="0"
                > {{ xAxisIsDate ? context.valueMultiplierName || 'milliseconds' : 'X-values' }},
                when
                <select
                    v-show="variableValueProp"
                    v-model="contextParameter(context, 'valueProp').value"
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
                        v-model="contextParameter(context, 'playWhenType').value"
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
                        v-model.number="contextParameter(context, 'playWhenThreshold').value"
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
                        v-model.number="contextParameter(context, 'playWhenMin').value"
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
                        v-model.number="contextParameter(context, 'playWhenMax').value"
                        :labelledby="slotProps.labelId"
                        :min="context.valueProp === 'x' ? xRange.min : yRange.min"
                        :max="context.valueProp === 'x' ? xRange.max : yRange.max"
                        :step="context.valueProp === 'x' ? xStep : yStep"
                    />
                </SEControl>
            </div>

            <button
                :aria-expanded="context.showDetails ? 'true' : 'false'"
                class="details-btn"
                @click="onToggleDetails(context)"
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
                        v-model="contextParameter(context, 'instrument').value"
                        :options="instruments"
                        @update:model-value="onInstrumentChange(context)"
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
                        v-model.number="contextParameter(context, 'volume').value"
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
                            v-model="contextParameter(context, 'pitchType').value"
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
                            v-model.number="contextParameter(context, 'pitchNote').value"
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
                            v-model.number="contextParameter(context, 'pitchMappingValue').value"
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
                        v-model.number="contextParameter(context, 'noteDuration').value"
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
                        v-model.number="contextParameter(context, 'pan').value"
                        :labelledby="slotProps.labelId"
                    />
                </SEControl>
            </div>
        </div>

        <SEButton
            class="add-btn"
            @click="addContext()"
        >
            <img
                alt=""
                :src="addIcon"
            > Add
        </SEButton>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SEButton from '../basic/SEButton.vue';
import SEControl from '../basic/SEControl.vue';
import SESlider from '../basic/SESlider.vue';
import SEDropdown from '../basic/SEDropdown.vue';
import SERadioGroup from '../basic/SERadioGroup.vue';
import addIcon from '../../assets/plus-solid.svg';
import removeIcon from '../../assets/xmark-solid.svg';
import arrowDownIcon from '../../assets/arrow-down.svg';
import { mapState, mapStores } from 'pinia';
import { useViewStore } from '../../store/modules/view';
import { useChartParametersStore } from '../../store/modules/chartParameters';
import {
    useGlobalSonifyParametersStore,
    type SonifyContext,
    type SonifyContextParameterName
} from '../../store/modules/globalSonifyParameters';

// A two-way binding to a parameter of a context cue, for v-model
interface ContextParameterBinding<K extends SonifyContextParameterName> {
    value: SonifyContext[K];
}

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


export default defineComponent({
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
        instruments(): Array<Record<'name' | 'value', string>> {
            return this.$chartBridge.getAvailableInstruments();
        },
        xRange(): Record<'min' | 'max', number> {
            return this.getPropRange('x');
        },
        yRange(): Record<'min' | 'max', number> {
            return this.getPropRange('y');
        },
        xStep(): number {
            return getSliderStep(this.xRange.max - this.xRange.min, 200);
        },
        yStep(): number {
            return getSliderStep(this.yRange.max - this.yRange.min, 200);
        },
        ...mapStores(useGlobalSonifyParametersStore),
        ...mapState(useViewStore, ['reactToDataUpdates', 'selectedHeaderTabContent']),
        ...mapState(useGlobalSonifyParametersStore, ['contexts']),
        ...mapState(useChartParametersStore, {
            xAxisIsDate: store => store.xAxisType === 'datetime'
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
        // Remove a context cue, and move the focus from its Remove button,
        // which is gone, to the next cue's, the previous cue's, or the Add
        // button
        onRemoveContext(id: number) {
            const index = this.contexts.findIndex((context) => context.id === id);
            this.globalSonifyParametersStore.removeContext(id);
            this.$announcer.announce('Context cue ' + id + ' removed.');
            this.$nextTick(() => {
                const removeButtons = (this.$el as HTMLElement).querySelectorAll<HTMLElement>('.remove-btn');
                const nextButton = removeButtons[Math.min(index, removeButtons.length - 1)] ||
                    (this.$el as HTMLElement).querySelector<HTMLElement>('.add-btn');
                nextButton?.focus();
            });
        },
        addContext(inactive = false) {
            const range = this.xRange.max - this.xRange.min;
            this.globalSonifyParametersStore.addContext({
                valueRange: this.xAxisIsDate ? range : null,
                inactive
            });
        },
        getPropRange(prop: string): Record<'min' | 'max', number> {
            const range = this.$chartBridge.reactiveGet(
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
        // Bind a parameter of a context cue with v-model: reads the parameter
        // of the cue in the store, and sets it through the store action.
        contextParameter<K extends SonifyContextParameterName>(
            context: SonifyContext,
            parameterName: K
        ): ContextParameterBinding<K> {
            const store = this.globalSonifyParametersStore;
            return {
                get value() {
                    return context[parameterName];
                },
                set value(value) {
                    store.setContextParameter({ id: context.id, parameterName, value });
                }
            };
        },
        onToggleDetails(context: SonifyContext) {
            this.globalSonifyParametersStore.setContextParameter({
                id: context.id,
                parameterName: 'showDetails',
                value: !context.showDetails
            });
        },
        onInstrumentChange(context: SonifyContext) {
            if (context.instrument && this.selectedHeaderTabContent !== 'dataContent') {
                this.$chartBridge.playAudioSample(context.instrument);
            }
        },
    }
});
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
