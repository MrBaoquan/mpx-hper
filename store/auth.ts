/* eslint-disable camelcase */
import { ref, watch } from '@mpxjs/core';
import { defineStore } from '@mpxjs/pinia';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import * as moment from 'moment';
import { computed } from 'vue';

const AUTH_TOKEN = 'un_auth_token';

const checkAuthToken = (token: string): boolean => {
    return token !== AUTH_TOKEN && token !== '';
};

export const useAuthStore = defineStore('mpxhper-auth', () => {
    const authResultCode = ref(-1); // -1 未授权 0 授权成功

    const SetAuthResultCode = (code: number) => {
        authResultCode.value = code;
    };

    const api_token = ref(AUTH_TOKEN);

    const setToken = (token: string) => {
        console.warn('setToken', token);
        api_token.value = token;
        saveToStorage('token_data', {
            api_token: token,
            update_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        });

        if (checkAuthToken(token)) {
            SetAuthResultCode(0);
        }
    };

    const isAuthed = computed(() => {
        return checkAuthToken(api_token.value);
    });

    // 尝试从缓存中读取token
    const tryAuth = (
        options: {
            expireDays: number;
        } = {
            expireDays: 1,
        }
    ): boolean => {
        const _tokenData = loadFromStorage('token_data');
        if (_tokenData !== null) {
            console.log('setToken from storage', _tokenData.api_token);
            api_token.value = _tokenData.api_token;
            const _updateTime = moment(_tokenData.update_time);
            if (moment().diff(_updateTime, 'days') > options.expireDays) {
                return false;
            }
            return true;
        }
        return api_token.value !== AUTH_TOKEN;
    };

    // 用户授权后回调
    function onAuthCompleted(callback: (authCode: number) => void) {
        if (authResultCode.value !== -1) {
            callback(authResultCode.value);
        } else {
            const stopWatch = watch(authResultCode, (newVal) => {
                if (newVal === -1) return;
                stopWatch();
                callback(newVal);
            });
        }
    }

    const openID = ref('');
    function setOpenID(id: string) {
        openID.value = id;
    }

    return {
        api_token,
        isAuthed,
        authResultCode,
        tryAuth,
        setToken,
        onAuthCompleted,
        SetAuthResultCode,
        openID,
        setOpenID,
    };
});
