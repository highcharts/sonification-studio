import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import PlayButtons from '../../../src/app/editor/components/PlayButtons.vue';
import { useViewStore } from '../../../src/app/editor/store/modules/view';

describe('PlayButtons.vue', () => {
    let pinia: Pinia;
    let wrapper: VueWrapper;
    const announce = vi.fn();
    const chartBridge = {
        playChart: vi.fn(),
        pauseChart: vi.fn(),
        stopChart: vi.fn(),
        playAdjacent: vi.fn()
    };

    const buttons = () => wrapper.findAll('button');
    const playPauseButton = () => buttons()[0];
    const stopButton = () => buttons()[1];

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
        wrapper = mount(PlayButtons, {
            attachTo: document.body,
            global: {
                plugins: [pinia],
                mocks: {
                    $chartBridge: chartBridge,
                    $announcer: { announce }
                }
            }
        });
    });

    afterEach(() => {
        wrapper.unmount();
        vi.clearAllMocks();
    });

    // Start playing and check the playing state
    const play = async () => {
        await playPauseButton().trigger('click');
        expect(chartBridge.playChart).toHaveBeenCalledOnce();
        expect(playPauseButton().text()).toBe('Pause');
        expect(stopButton().attributes('disabled')).toBeUndefined();
    };

    const expectStopped = () => {
        expect(chartBridge.stopChart).toHaveBeenCalledOnce();
        expect(playPauseButton().text()).toBe('Play');
        expect(stopButton().attributes('disabled')).toBeDefined();
    };

    test('Stops playback when the data updates', async () => {
        await play();

        useViewStore().triggerDataReactivity();
        await wrapper.vm.$nextTick();

        expectStopped();
    });

    test('Stops playback when the parameters update', async () => {
        await play();

        useViewStore().triggerParameterReactivity();
        await wrapper.vm.$nextTick();

        expectStopped();
    });

    test('Resets a paused playback when the data updates', async () => {
        await play();
        await playPauseButton().trigger('click');
        expect(chartBridge.pauseChart).toHaveBeenCalledOnce();
        expect(playPauseButton().text()).toBe('Play');
        // Paused: stop is still enabled
        expect(stopButton().attributes('disabled')).toBeUndefined();

        useViewStore().triggerDataReactivity();
        await wrapper.vm.$nextTick();

        expectStopped();
    });

    test('Does not stop for other view store updates', async () => {
        await play();

        useViewStore().setPlaybackProgress(50);
        useViewStore().selectSidebarTab('Audio');
        await wrapper.vm.$nextTick();

        expect(chartBridge.stopChart).not.toHaveBeenCalled();
        expect(playPauseButton().text()).toBe('Pause');
    });

    test('Says playback stopped when a change stops it, but not when nothing played', async () => {
        useViewStore().triggerParameterReactivity();
        await wrapper.vm.$nextTick();
        expect(announce).not.toHaveBeenCalled();

        await play();
        useViewStore().triggerDataReactivity();
        await wrapper.vm.$nextTick();
        expect(announce).toHaveBeenCalledExactlyOnceWith('Playback stopped.');
    });

    test('Says so when its shortcut toggles loop, and that playback stopped', async () => {
        const pressCtrlT = () => document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 't', keyCode: 84, ctrlKey: true, bubbles: true, cancelable: true
        }));

        pressCtrlT();
        await wrapper.vm.$nextTick();
        expect(announce).toHaveBeenLastCalledWith('Loop enabled.');

        await play();
        pressCtrlT();
        await wrapper.vm.$nextTick();
        expect(announce).toHaveBeenLastCalledWith('Loop disabled. Playback stopped.');
        expect(playPauseButton().text()).toBe('Play');
    });

    test('Moves the focus from Stop to Play, as Stop is disabled', async () => {
        await play();
        (stopButton().element as HTMLButtonElement).focus();

        await stopButton().trigger('click');
        await wrapper.vm.$nextTick();

        expect(stopButton().attributes('disabled')).toBeDefined();
        expect(document.activeElement).toBe(playPauseButton().element);
    });

    test('Leaves the focus alone when it is not on Stop', async () => {
        await play();
        (playPauseButton().element as HTMLButtonElement).focus();
        useViewStore().triggerDataReactivity();
        await wrapper.vm.$nextTick();
        expect(document.activeElement).toBe(playPauseButton().element);
    });
});
