import { ref } from 'vue'

export default function useDebounceCallback (
  callback,
  {
    leading = false,
    maxWait,
    wait = maxWait || 0
  }
) {
  const prev = ref(0)
  let trailingTimeout
  const clearTrailing = () => trailingTimeout && clearTimeout(trailingTimeout)

  const fn = (...args) => {
    const now = Date.now()

    function call () {
      prev.value = now
      clearTrailing()
      callback.apply(null, args)
    }

    const last = prev.value
    const offset = now - last

    // leading
    if (last === 0) {
      if (leading) {
        call()
      }
      prev.value = now
    }

    // body
    if (maxWait !== undefined) {
      if (offset > maxWait) {
        call()
        return
      }
    } else if (offset < wait) {
      prev.value = now
    }

    // trailing
    clearTrailing()
    trailingTimeout = setTimeout(() => {
      call()
      prev.value = 0
    }, wait)
  }

  fn.cancel = clearTrailing

  return fn
}
