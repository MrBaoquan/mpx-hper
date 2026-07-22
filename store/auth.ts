/* eslint-disable camelcase */
import { ref, watch } from '@mpxjs/core';
import { defineStore } from '@mpxjs/pinia';
import { loadFromStorage, removeFromStorage, saveToStorage } from '../utils/storage';
import * as dayjs from 'dayjs';
import { computed } from 'vue';
import { normalizeUserInfo } from '../utils/validator';

const AUTH_TOKEN = 'un_auth_token';
const OPEN_ID_STORAGE_KEY = 'szsng_openid';

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

        console.log(`保存token: ${token}, 有效期至: ${dayjs(expireTimestamp).format('YYYY-MM-DD HH:mm:ss')}`);

        if (checkAuthToken(token)) {
            SetAuthResultCode(0);
        }
    };

    const clearToken = () => {
        api_token.value = AUTH_TOKEN;
        removeFromStorage('token_data');
        SetAuthResultCode(-1);
        clearQueueToken();
        resetPermissions();
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

            const _expireTime = dayjs(_tokenData.expire_at);
            console.log('token 过期时间: ' + _expireTime.format('YYYY-MM-DD HH:mm:ss'));

            if (dayjs().diff(_expireTime, 'seconds') > 0) {
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

    const openID = ref(String(loadFromStorage(OPEN_ID_STORAGE_KEY) || ''));
    function setOpenID(id: string) {
        openID.value = id;
        if (id) {
            saveToStorage(OPEN_ID_STORAGE_KEY, id);
        } else {
            removeFromStorage(OPEN_ID_STORAGE_KEY);
        }
    }

    const loginPopupVisible = ref(false);
    const loginPopupTitle = ref('手机号授权登录');
    const loginPopupDescription = ref('请先完成手机号授权登录，再继续当前操作。');
    const loginPopupBenefitText = ref('联系人管理、预约用户态信息以及需要登录态的后续流程。');
    const loginPopupHosts = new Map<string, number>();

    function registerLoginPopupHost(route: string) {
        if (!route) return;
        loginPopupHosts.set(route, (loginPopupHosts.get(route) || 0) + 1);
    }

    function unregisterLoginPopupHost(route: string) {
        if (!route) return;
        const count = loginPopupHosts.get(route) || 0;
        if (count <= 1) {
            loginPopupHosts.delete(route);
            return;
        }
        loginPopupHosts.set(route, count - 1);
    }

    function hasLoginPopupHost() {
        const pages = getCurrentPages();
        const currentRoute = pages[pages.length - 1]?.route || '';
        return (loginPopupHosts.get(currentRoute) || 0) > 0;
    }

    function showLoginPopup(
        options: {
            title?: string;
            description?: string;
            benefitText?: string;
        } = {},
    ) {
        loginPopupTitle.value = options.title || '手机号授权登录';
        loginPopupDescription.value = options.description || '请先完成手机号授权登录，再继续当前操作。';
        loginPopupBenefitText.value = options.benefitText || '联系人管理、预约用户态信息以及需要登录态的后续流程。';
        loginPopupVisible.value = true;
    }

    function hideLoginPopup() {
        loginPopupVisible.value = false;
    }

    const queueToken = ref('');
    const queueTokenExpireAt = ref(0);

    function setQueueToken(token: string, expireSeconds = 0) {
        queueToken.value = token;
        queueTokenExpireAt.value = expireSeconds > 0 ? Date.now() + expireSeconds * 1000 : 0;
    }

    function refreshQueueToken(expireSeconds = 300) {
        if (queueToken.value === '') return;
        queueTokenExpireAt.value = Date.now() + expireSeconds * 1000;
    }

    function clearQueueToken() {
        queueToken.value = '';
        queueTokenExpireAt.value = 0;
    }

    function hasValidQueueToken() {
        if (queueToken.value === '') return false;
        if (queueTokenExpireAt.value === 0) return true;
        return queueTokenExpireAt.value > Date.now();
    }

    // ===== 权限接口：角色-权限映射与校验 =====
    // 在通用框架中不限定具体权限键，交由业务项目定义
    type FeatureKey = string;

    interface RolePermissionEntry {
        role: string;
        features: FeatureKey[];
    }

    // 示例默认角色权限（不包含具体业务权限）。
    // 真实项目应在启动时通过 configurePermissions 注入自己的映射。
    const DEFAULT_ROLE_PERMISSIONS: RolePermissionEntry[] = [
        { role: '管理员', features: [] },
        { role: '游客', features: [] },
    ];

    // 可配置的角色权限及默认特性（由业务侧注入）
    let ROLE_PERMISSION_CONFIG: RolePermissionEntry[] = [];
    let DEFAULT_FEATURES: FeatureKey[] = [];
    let customRoleResolver: ((user: any) => Array<{ roleName: string; venueId?: number; venueName?: string }>) | undefined;

    /**
     * 业务侧配置权限映射与角色解析
     */
    const configurePermissions = (opts: { roles?: RolePermissionEntry[]; defaultFeatures?: FeatureKey[]; roleResolver?: (user: any) => Array<{ roleName: string; venueId?: number; venueName?: string }> }) => {
        ROLE_PERMISSION_CONFIG = Array.isArray(opts.roles) ? opts.roles : ROLE_PERMISSION_CONFIG;
        DEFAULT_FEATURES = Array.isArray(opts.defaultFeatures) ? opts.defaultFeatures : DEFAULT_FEATURES;
        customRoleResolver = opts.roleResolver || customRoleResolver;
        console.log('🔧 permissions configured', {
            roles: ROLE_PERMISSION_CONFIG,
            default: DEFAULT_FEATURES,
            hasCustomResolver: !!customRoleResolver,
        });
    };

    const GLOBAL_SCOPE = '*';
    const permissionMap = ref<Record<string, FeatureKey[]>>({});

    const resetPermissions = () => {
        permissionMap.value = {};
    };

    const grantPermissions = (features: FeatureKey[], scope: string = GLOBAL_SCOPE) => {
        const existing = new Set(permissionMap.value[scope] || []);
        features.forEach((f) => existing.add(f));
        permissionMap.value[scope] = Array.from(existing);
    };

    const hasPermission = (feature: FeatureKey, scope?: string | number): boolean => {
        const key = scope === undefined ? GLOBAL_SCOPE : String(scope);
        const global = new Set(permissionMap.value[GLOBAL_SCOPE] || []);
        const local = new Set(permissionMap.value[key] || []);
        return global.has(feature) || local.has(feature);
    };

    const can = (feature: FeatureKey, scope?: string | number) => hasPermission(feature, scope);

    const getUserRoles = (user: any): Array<{ roleName: string; venueId?: number; venueName?: string }> => {
        if (customRoleResolver) return customRoleResolver(user) || [];
        const roles = Array.isArray(user?.roles) ? user.roles : [];
        return roles.map((r: any) => ({ roleName: r.roleName || r.role || '', venueId: r.venueId, venueName: r.venueName }));
    };

    const loadPermissionsFromUser = (user: any) => {
        resetPermissions();
        const roles = getUserRoles(user);
        const source = ROLE_PERMISSION_CONFIG.length > 0 ? ROLE_PERMISSION_CONFIG : DEFAULT_ROLE_PERMISSIONS;
        roles.forEach((r) => {
            const scope = r.venueId !== undefined ? String(r.venueId) : r.venueName ? String(r.venueName) : GLOBAL_SCOPE;
            const entry = source.find((e) => e.role === (r.roleName || '').trim());
            const features = entry ? entry.features : DEFAULT_FEATURES;
            if (features && features.length > 0) grantPermissions(features, scope);
        });
        console.log('🔐 permissions loaded:', permissionMap.value);
    };

    /**
     * 转换用户信息
     * @param rawUserData 原始用户数据
     * @returns 转换后的用户信息
     */
    function transformUserData(rawUserData: any) {
        console.log('🔧 transformUserData - 输入数据:', rawUserData);

        try {
            const result = normalizeUserInfo(rawUserData);
            console.log('🔧 transformUserData - 输出数据:', result);
            // 根据角色加载权限
            loadPermissionsFromUser(result);
            return result;
        } catch (error: any) {
            console.error('🔧 transformUserData - 转换异常:', error);
            throw error;
        }
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
        loginPopupVisible,
        loginPopupTitle,
        loginPopupDescription,
        loginPopupBenefitText,
        registerLoginPopupHost,
        unregisterLoginPopupHost,
        hasLoginPopupHost,
        showLoginPopup,
        hideLoginPopup,
        queueToken,
        queueTokenExpireAt,
        setQueueToken,
        refreshQueueToken,
        clearQueueToken,
        hasValidQueueToken,
        transformUserData,
        // permissions api
        permissionMap,
        hasPermission,
        can,
        grantPermissions,
        resetPermissions,
        loadPermissionsFromUser,
        configurePermissions,
    };
});
