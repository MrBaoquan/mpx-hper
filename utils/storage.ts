const saveToStorage = (key: string, value: any) => {
    if (__mpx_mode__ === 'web') {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        wx.setStorageSync(key, value);
    }
};

const loadFromStorage = (key: string): any => {
    if (__mpx_mode__ === 'web') {
        let _contactStr = localStorage.getItem(key);
        if (_contactStr) {
            return JSON.parse(_contactStr);
        }
    } else {
        const usersFromCookie = wx.getStorageSync(key);
        if (usersFromCookie) {
            return usersFromCookie;
        }
    }
    return null;
};

const removeFromStorage = (key: string) => {
    if (__mpx_mode__ === 'web') {
        localStorage.removeItem(key);
    } else {
        wx.removeStorageSync(key);
    }
};

export { saveToStorage, loadFromStorage, removeFromStorage };
