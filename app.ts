import mpx from '@mpxjs/core';
import { useHperStore } from './store/helper';
import { createPinia } from '@mpxjs/pinia';
import mpxFetch from '@mpxjs/fetch';
import { useAuthStore } from './store/auth';

const pinia = createPinia();
const hperStore = useHperStore();
const authStore = useAuthStore();
const initMpxHper = (options: {} = {}) => {
    console.log('initMpxHper');
    mpx.use(mpxFetch);
    mpx.use(pinia);

    mpx.xfetch.interceptors.request.use((config) => {
        config.header = {
            'x-token': authStore.$state.api_token,
            Authorization: 'Bearer ' + authStore.$state.api_token,
            ...config.header,
        };
        return config;
    });

    if (__mpx_mode__ === 'wx') {
        const systemInfo = wx.getSystemInfoSync();
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
        const navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
        const menuBottom = menuButtonInfo.top - systemInfo.statusBarHeight;
        const menuHeight = menuButtonInfo.height;
        hperStore.$state.navBarHeight = navBarHeight;
        hperStore.$state.capsuleHeight = menuHeight;
        hperStore.$state.capsuleBottom = menuBottom;
    }
};

const getH5WXCode = () => {
    if (__mpx_mode__ === 'web') {
        const _urlParams = new URLSearchParams(window.location.search);
        const _code = _urlParams.get('code');
        if (_code) {
            return _code;
        }
    }
    return '';
};

const hasWXH5Code = () => {
    if (__mpx_mode__ === 'web') {
        if (getH5WXCode() !== '') return true;
    }
    return false;
};

const checkAuth = (): boolean => {
    if (__mpx_mode__ === 'web') {
        const authStore = useAuthStore();
        if (authStore.tryAuth()) {
            return true;
        }
        if (hasWXH5Code()) return true;
    }
    return false;
};

export { initMpxHper, checkAuth, hasWXH5Code, getH5WXCode };
