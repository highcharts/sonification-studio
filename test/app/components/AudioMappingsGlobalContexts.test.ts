import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import AudioMappingsGlobalContexts from '../../../src/app/editor/components/mappings/AudioMappingsGlobalContexts.vue';
import { useGlobalSonifyParametersStore } from '../../../src/app/editor/store/modules/globalSonifyParameters';

describe('AudioMappingsGlobalContexts.vue', () => {
    let pinia: Pinia;
    let wrapper: VueWrapper;
    let chartBridge: {
        getAvailableInstruments: () => Array<Record<'name' | 'value', string>>;
        reactiveGet: () => Record<'min' | 'max', number>;
        forceUpdate: ReturnType<typeof vi.fn>;
        playAudioSample: ReturnType<typeof vi.fn>;
    };
    let actions: string[];

    const store = () => useGlobalSonifyParametersStore(pinia);
    const context = () => store().contexts[0];

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
        // Context ids come from a module-level counter, reset it
        store().restoreStoreState();
        actions = [];
        store().$onAction(({ name }) => {
            actions.push(name);
        });
        chartBridge = {
            getAvailableInstruments: () => [
                { name: 'Chop', value: 'chop' },
                { name: 'Flute', value: 'flute' }
            ],
            reactiveGet: () => ({ min: 0, max: 100 }),
            forceUpdate: vi.fn(),
            playAudioSample: vi.fn()
        };
        wrapper = mount(AudioMappingsGlobalContexts, {
            props: { variableValueProp: true },
            global: {
                plugins: [pinia],
                mocks: { $chartBridge: chartBridge }
            }
        });
    });

    afterEach(() => {
        wrapper.unmount();
    });

    test('Adds an inactive context cue through the store when there is none', () => {
        expect(actions).toEqual(['addContext']);
        expect(store().contexts).toHaveLength(1);
        expect(context().playWhenType).toBe('never');
        expect(wrapper.find('h6').text()).toBe('Context cue 1');
    });

    test('Shows the parameters of the cue in the store', async () => {
        store().setContextParameter({ id: 1, parameterName: 'volume', value: 55 });
        store().setContextParameter({ id: 1, parameterName: 'valueProp', value: 'y' });
        await flushPromises();
        const volume = wrapper.findAll('.details input[type="range"]')[0];
        expect((volume.element as HTMLInputElement).value).toBe('55');
        expect((wrapper.find('select[aria-label="Value property"]').element as HTMLSelectElement).value).toBe('y');
    });

    test('Sets edited parameters through the store action, as v-model did', async () => {
        actions = [];

        // Native number input: v-model makes numbers of the values
        await wrapper.find('input[aria-label="Context interval"]').setValue('2.5');
        expect(context().valueInterval).toBe(2.5);

        // Native selects
        await wrapper.find('select[aria-label="Value property"]').setValue('y');
        expect(context().valueProp).toBe('y');
        await wrapper.find('select[aria-label="Play when"]').setValue('between');
        expect(context().playWhenType).toBe('between');

        // Slider with v-model.number
        await wrapper.findAll('.details input[type="range"]')[0].setValue('30');
        expect(context().volume).toBe(30);

        // Radio group
        await wrapper.find('.details input[type="radio"][value="mappped"]').setValue();
        expect(context().pitchType).toBe('mappped');

        expect(new Set(actions)).toEqual(new Set(['setContextParameter']));
        expect(chartBridge.forceUpdate).toHaveBeenCalledWith(true);
    });

    test('Edits only the cue of the card', async () => {
        await wrapper.find('.add-btn').trigger('click');
        const first = { ...store().contexts[0] };
        const second = { ...store().contexts[1] };
        const cards = wrapper.findAll('.context-card');
        expect(cards).toHaveLength(2);

        await cards[1].find('input[aria-label="Context interval"]').setValue('4');
        await cards[1].find('select[aria-label="Value property"]').setValue('y');
        await cards[1].findAll('.details input[type="range"]')[0].setValue('20');
        await cards[1].find('.details .se-dropdown select').setValue('flute');
        await cards[1].find('.details-btn').trigger('click');

        expect(store().contexts).toEqual([first, {
            ...second,
            valueInterval: 4,
            valueProp: 'y',
            volume: 20,
            instrument: 'flute',
            showDetails: false
        }]);
        expect(cards[0].find('.details-btn').attributes('aria-expanded')).toBe('true');
        expect(cards[1].find('.details-btn').attributes('aria-expanded')).toBe('false');
    });

    test('Sets the instrument through the store action, then plays a sample of it', async () => {
        await wrapper.find('.details .se-dropdown select').setValue('flute');
        expect(context().instrument).toBe('flute');
        expect(chartBridge.playAudioSample).toHaveBeenCalledWith('flute');
    });

    test('Toggles the details through the store action', async () => {
        const button = wrapper.find('.details-btn');
        expect(button.attributes('aria-expanded')).toBe('true');
        actions = [];

        await button.trigger('click');
        expect(actions).toEqual(['setContextParameter']);
        expect(context().showDetails).toBe(false);
        expect(button.attributes('aria-expanded')).toBe('false');

        await button.trigger('click');
        expect(context().showDetails).toBe(true);
    });

    test('Adds cues that play, while the placeholder cue added on mount does not', async () => {
        expect(context().playWhenType).toBe('never');
        await wrapper.find('.add-btn').trigger('click');
        expect(store().contexts.map(c => [c.id, c.playWhenType])).toEqual([[1, 'never'], [2, 'always']]);
    });

    test('Adds and removes context cues through the store', async () => {
        await wrapper.find('.add-btn').trigger('click');
        expect(store().contexts.map(c => c.id)).toEqual([1, 2]);

        await wrapper.findAll('.remove-btn')[0].trigger('click');
        expect(store().contexts.map(c => c.id)).toEqual([2]);
        expect(wrapper.find('h6').text()).toBe('Context cue 2');
    });
});
