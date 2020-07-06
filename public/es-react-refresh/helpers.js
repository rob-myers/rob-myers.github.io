let isUpdateScheduled = false

function scheduleUpdate() {
  if (isUpdateScheduled) return

  isUpdateScheduled = true
  setTimeout(function () {
    isUpdateScheduled = false
    try {
      RefreshRuntime.performReactRefresh()
    } catch (err) {
      console.warn(
        'Warning: Failed to re-render. We will retry on the next Fast Refresh event.\n' +
          err
      )
    }
  }, 30)
}

export default {
  scheduleUpdate,
};