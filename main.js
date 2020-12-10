import Vue from 'vue'
import App from './App'
import store from './store'
import HttpRequest from './common/httpRequest'
import queue from './common/queue'
//import getCode from './components/get-code'

import uView from 'uview-ui'
Vue.use(uView);

Vue.config.productionTip = false;

//Vue.component('getCode', getCode);

App.mpType = 'app';
Vue.prototype.$Request = HttpRequest;
Vue.prototype.$queue = queue;
Vue.prototype.$store = store
const app = new Vue({
    ...App
});
app.$mount();
