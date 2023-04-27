import { computed } from 'vue'
export default function useAnimationPosition (state) {
  const autoWidth = computed(() => state.width * state.scale)

  const autoHeight = computed(() => state.height * state.scale)

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
    state.scale
  ]
}
