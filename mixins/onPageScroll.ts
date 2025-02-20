/* eslint-disable @typescript-eslint/no-explicit-any */
export default {
    data: {
        navBarOpacity: 0,
    },

    onPageScroll({ scrollTop }) {
        if (__mpx_mode__ !== 'wx') return;
        const $refs = (this as any).$refs;
        $refs.navBar?.setPageScrollTop(scrollTop);
        const that = this as any;

        that.setData({
            navBarOpacity: $refs.navBar.renderOpacity,
        });
    },
};
