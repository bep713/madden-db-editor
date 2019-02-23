import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'MaddenDatabase',
      component: require('@/components/MaddenDatabase').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
