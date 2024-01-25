import { ref } from '@mpxjs/core';
import { defineStore } from '@mpxjs/pinia';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import * as moment from 'moment';

const AUTH_TOKEN = 'un_auth_token';

export const useAuthStore = defineStore('mpxhper-auth', () => {
    const api_token = ref(AUTH_TOKEN);

    const hasToken = () => {
        return api_token.value !== AUTH_TOKEN;
    };

    const setToken = (token: string) => {
        console.warn('setToken', token);
        api_token.value = token;
        saveToStorage('token_data', {
            api_token: token,
            update_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        });
    };

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
            api_token.value = _tokenData.api_token;
            const _updateTime = moment(_tokenData.update_time);
            if (moment().diff(_updateTime, 'days') > options.expireDays) {
                return false;
            }
            return true;
        }
        return api_token.value !== AUTH_TOKEN;
    };

    return {
        api_token,
        tryAuth,
        setToken,
        hasToken,
    };
});
