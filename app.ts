import mpx from "@mpxjs/core";
import { useHperStore } from "./store/helper";
import { createPinia } from "@mpxjs/pinia";

const pinia = createPinia();

const hperStore = useHperStore();
const initMpxHper = () => {
  mpx.use(pinia);
  const systemInfo = wx.getSystemInfoSync();
  const menuButtonInfo = wx.getMenuButtonBoundingClientRect();

  const navBarHeight =
    (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 +
    menuButtonInfo.height +
    systemInfo.statusBarHeight;

  const menuBottom = menuButtonInfo.top - systemInfo.statusBarHeight;
  const menuHeight = menuButtonInfo.height;

  hperStore.$state.navBarHeight = navBarHeight;
  hperStore.$state.capsuleHeight = menuHeight;
  hperStore.$state.capsuleBottom = menuBottom;
};

export default initMpxHper;
