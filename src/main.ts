import { createSSRApp } from 'vue'
import App from './App.vue'
import './styles.css'
import vconsole from 'vconsole'

new vconsole()

export function createApp () {
  const app = createSSRApp(App)
  return {
    app
  }
}
