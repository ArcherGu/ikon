import { useRegisterSW } from 'virtual:pwa-register/vue'
import { type WatchStopHandle, nextTick, watchEffect } from 'vue'

const { needRefresh, updateServiceWorker } = useRegisterSW()
let updateWatcher: WatchStopHandle
function updateCheck() {
  nextTick(() => {
    if (!updateWatcher) {
      updateWatcher = watchEffect(() => {
        if (needRefresh.value) {
          // eslint-disable-next-line no-alert
          if (confirm('New version available, update now?'))
            updateServiceWorker(true)
        }
      })
    }
  })
}

updateCheck()
