import mpx from '@mpxjs/core';
import { useHperStore } from './store/helper';
import { createPinia } from '@mpxjs/pinia';
import mpxFetch from '@mpxjs/fetch';
import { useAuthStore } from './store/auth';

const pinia = createPinia();

const initMpxHper = () => {
    console.log('initMpxHper');
    mpx.use(mpxFetch);
    mpx.use(pinia);

    mpx.xfetch.interceptors.request.use((config) => {
        const authStore = useAuthStore();
        config.header = {
            'x-token': authStore.api_token,
            Authorization: 'Bearer ' + authStore.api_token,
            ...config.header,
        };
        return config;
    });
    const hperStore = useHperStore();
    if (__mpx_mode__ === 'wx') {
        hperStore.refreshSystemSettings();
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
