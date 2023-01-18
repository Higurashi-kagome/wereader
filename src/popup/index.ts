import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'

Vue.use(ElementUI)

new Vue({
	el: "#popup-container", // 挂载的 html 节点
	render: h => h(App) // 渲染，相当于 render: function(createElement){return createElement(App)}
})