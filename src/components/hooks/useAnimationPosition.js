import { computed } from 'vue'
import useTargetScale from './useTargetScale'

export default function useAnimationPosition (state, speed) {
  const { autoWidth, autoHeight, autoScale } = useTargetScale(state, speed)

  // 偏移量，x: 0, y: 0 居中为初始
  const centerWidth = innerWidth / 2
  const centerHeight = innerHeight / 2
  const translateX = computed(() => {
    const offsetX = centerWidth - (state.width * state.scale) / 2
    return state.x + offsetX
  })
  const translateY = computed(() => {
    const offsetY = centerHeight - (state.height * state.scale) / 2
    return state.y + offsetY
  })

  return [
    translateX,
    translateY,
    autoWidth,
    autoHeight,
    autoScale
  ]
}
