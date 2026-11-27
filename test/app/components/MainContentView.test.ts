import { afterEach, describe, expect, test, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import MainContentView from '../../../src/app/editor/components/MainContentView.vue';
import { useViewStore } from '../../../src/app/editor/store/modules/view';

// The sidebar, as far as hiding it goes: its Hide button emits hide
const SidebarStub = defineComponent({
    emits: ['hide'],
    setup(_props, { emit, expose }) {
        expose({ focusHideButton: vi.fn() });
        return () => h('button', { class: 'hide-btn', onClick: () => emit('hide') }, 'Hide');
    }
});

describe('MainContentView.vue', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('Moves the focus to the Show sidebar button when the sidebar is hidden', async () => {
        const pinia = createPinia();
        const reflowChart = vi.fn();
        const wrapper = mount(MainContentView, {
            attachTo: document.body,
            global: {
                plugins: [pinia],
                mocks: { $chartBridge: { reflowChart } },
                stubs: {
                    Sidebar: SidebarStub,
                    EditorData: true,
                    PlayControls: true,
                    Preview: true,
                    TextDescription: true
                }
            }
        });
        const hideButton = wrapper.find('.hide-btn');
        (hideButton.element as HTMLButtonElement).focus();

        await hideButton.trigger('click');
        await wrapper.vm.$nextTick();

        expect(useViewStore(pinia).sidebarVisible).toBe(false);
        expect(reflowChart).toHaveBeenCalledOnce();
        expect(document.activeElement?.getAttribute('aria-label')).toBe('Show sidebar');
        wrapper.unmount();
    });
});
