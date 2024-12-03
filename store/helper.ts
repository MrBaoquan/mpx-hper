import { computed, ref } from '@mpxjs/core';
import { defineStore } from '@mpxjs/pinia';

export const useHperStore = defineStore('helper', () => {
    const navBarHeight = ref(0);
    const capsuleHeight = ref(0);
    const capsuleBottom = ref(0);

    // windowHeight
    const windowHeight = ref(0);
    const windowWidth = ref(0);

    // 屏幕宽高比
    const ratio = computed(() => {
        return windowWidth.value / windowHeight.value;
    });

    const getHeight = (width: number) => {
        return width * ratio.value;
    };

    // 去除导航栏的高度
    const contentHeight = ref(0);
    const screenHeight = ref(0);

    const statusBarHeight = ref(0);

    const refreshSystemSettings = () => {
        const windowInfo = wx.getWindowInfo();
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
        const _navBarHeight = (menuButtonInfo.top - windowInfo.statusBarHeight) * 2 + menuButtonInfo.height + windowInfo.statusBarHeight;
        const _menuBottom = menuButtonInfo.top - windowInfo.statusBarHeight;
        const _menuHeight = menuButtonInfo.height;

        navBarHeight.value = _navBarHeight;
        capsuleHeight.value = _menuHeight;
        capsuleBottom.value = _menuBottom;

        windowHeight.value = windowInfo.windowHeight;
        windowWidth.value = windowInfo.windowWidth;
        contentHeight.value = windowInfo.windowHeight;
        screenHeight.value = windowInfo.screenHeight;

        statusBarHeight.value = windowInfo.statusBarHeight;

        console.log(`屏幕高度: ${windowInfo.screenHeight}, 窗口高度: ${windowInfo.windowHeight},  导航栏高度: ${navBarHeight.value}, 胶囊高度: ${capsuleHeight.value}`);
    };

    return {
        navBarHeight,
        capsuleHeight,
        capsuleBottom,
        windowHeight,
        windowWidth,
        contentHeight,
        screenHeight,
        statusBarHeight,
        refreshSystemSettings,
        getHeight,
        ratio,
    };
});
