/* eslint-disable camelcase */
import { ref, watch } from '@mpxjs/core';
import { defineStore } from '@mpxjs/pinia';
import { loadFromStorage, removeFromStorage, saveToStorage } from '../utils/storage';
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
    const setToken = (token: string, expireTimestamp = 0) => {
        console.warn('setToken', token);
        api_token.value = token;
        saveToStorage('token_data', {
            api_token: token,
            expire_at: expireTimestamp,
        });

        console.log(`保存token: ${token}, 有效期至: ${moment(expireTimestamp).format('YYYY-MM-DD HH:mm:ss')}`);

        if (checkAuthToken(token)) {
            SetAuthResultCode(0);
        }
    };

    const clearToken = () => {
        api_token.value = AUTH_TOKEN;
        removeFromStorage('token_data');
    };

    const isAuthed = computed(() => {
        return checkAuthToken(api_token.value);
    });

    const isAuth = () => {
        return checkAuthToken(api_token.value);
    };

    // 尝试从缓存中读取token
    const tryAuth = (): boolean => {
        const _tokenData = loadFromStorage('token_data');
        if (_tokenData !== null) {
            if (_tokenData.expire_at === null) return false;
            if (_tokenData.api_token === null) return false;

            api_token.value = _tokenData.api_token;

            const _expireTime = moment(_tokenData.expire_at);
            console.log('token 过期时间: ' + _expireTime.format('YYYY-MM-DD HH:mm:ss'));

            if (moment().diff(_expireTime, 'seconds') > 0) {
                return false;
            }

            SetAuthResultCode(0);
            return true;
        }
        return api_token.value !== AUTH_TOKEN;
    };

    // 用户授权后回调
    function onAuthCompleted(callback: (authCode: number) => void) {
        console.log('onAuthCompleted', authResultCode.value);
        if (authResultCode.value !== -1) {
            callback(authResultCode.value);
        } else {
            // const stopWatch =
            watch(authResultCode, (newVal) => {
                console.log('onAuthCompleted', newVal);
                if (newVal === -1) return;
                // stopWatch();
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
        isAuth,
        isAuthed,
        authResultCode,
        tryAuth,
        setToken,
        clearToken,
        onAuthCompleted,
        SetAuthResultCode,
        openID,
        setOpenID,
    };
});
