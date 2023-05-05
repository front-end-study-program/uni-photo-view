import { ref } from 'vue'
import useDebounceCallback from './useDebounceCallback'
/**
 * 单击和双击事件处理
 * @param singleTap - 单击事件
 * @param doubleTap - 双击事件
 * @return invokeTap
 */

export default function useContinuousTap (singleTap, doubleTap) {
  // 当前连续点击次数
  const continuousClick = ref(0)

  const debounceTap = useDebounceCallback(
    (...args) => {
      continuousClick.value = 0
      singleTap(...args)
    },
    {
      wait: 300
    }
  )

  return function invokeTap (...args) {
    continuousClick.value += 1
    debounceTap(...args)
    // 双击
    if (continuousClick.value >= 2) {
      debounceTap.cancel()
      continuousClick.value = 0
      doubleTap(...args)
    }
  }
}
