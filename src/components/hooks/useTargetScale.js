import { reactive, computed, watch } from 'vue'
import useDebounceCallback from './useDebounceCallback'

/**
 * 目标缩放延迟处理
 */
export default function useTargetScale (state, speed) {
  const innerState = reactive({
    lead: true,
    scale: state.scale
  })

  const moveScale = useDebounceCallback(
    (current) => {
      state.pause = true
      Object.assign(innerState, {
        lead: false,
        scale: current
      })
    },
    { wait: speed }
  )

  watch(() => state.scale, () => {
    state.pause = false
    innerState.lead = true
    moveScale(state.scale)
  })

  const autoWidth = computed(() => {
    if (innerState.lead) {
      return state.width * innerState.scale
    } else {
      return state.width * state.scale
    }
  })

  const autoHeight = computed(() => {
    if (innerState.lead) {
      return state.height * innerState.scale
    } else {
      return state.height * state.scale
    }
  })

  const autoScale = computed(() => {
    if (innerState.lead) {
      return state.scale / innerState.scale
    } else {
      return 1
    }
  })

  return {
    autoWidth,
    autoHeight,
    autoScale
  }
}
