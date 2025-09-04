import { createApp } from 'vue'
import './assets/style.css' // 使用第二段的 CSS 路徑
import App from './App.vue'
// 如果要切換成其他組件，可用下面這行替代
// import App from './components/TOP10.vue'

import pinia from './stores'
import router from './router'

createApp(App).use(pinia).use(router).mount('#app')