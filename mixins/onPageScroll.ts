/* eslint-disable @typescript-eslint/no-explicit-any */
export default {
  onPageScroll({ scrollTop }) {
    const $refs = (this as any).$refs
    $refs.navBar.setPageScrollTop(scrollTop)
  }
}
