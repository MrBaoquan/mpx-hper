/* eslint-disable @typescript-eslint/no-explicit-any */
export default {
    onPageScroll({ scrollTop }) {
        if (__mpx_mode__ !== 'wx') return;
        const $refs = (this as any).$refs;
        $refs.navBar?.setPageScrollTop(scrollTop);
    },
};
