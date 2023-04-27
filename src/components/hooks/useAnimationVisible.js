import { ref, watch } from 'vue'
/**
 * 动画关闭处理真实关闭状态
 * 通过 onAnimationEnd 回调实现 leaveCallback
 */
export default function useAnimationVisible (visible) {
  const activeAnimation = ref(0)
  const realVisible = ref(visible.value)

  watch(visible, (val) => {
    if (val) {
      realVisible.value = val
      activeAnimation.value = 1
    } else {
      activeAnimation.value = 2
    }
  },
  {
    immediate: true
  })

  function onAnimationEnd () {
    // 结束动画：设置隐藏状态
    if (activeAnimation.value === 2) {
      realVisible.value = false
    }

    // 重置状态
    activeAnimation.value = 0
  }

  return {
    activeAnimation,
    realVisible,
    onAnimationEnd
  }
}
