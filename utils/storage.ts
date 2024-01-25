const saveToStorage = (key: string, value: any) => {
    if (__mpx_mode__ === 'web') {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        wx.setStorageSync(key, value);
    }
};

const loadFromStorage = (key: string): any => {
    if (__mpx_mode__ === 'web') {
        const data = localStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }
    } else {
        const data = wx.getStorageSync(key);
        if (data) {
            return data;
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
