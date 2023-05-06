<template>
  <view
    v-if="realVisible"
    class="PhotoView-Portal"
    :class="{
      'PhotoView-Slider__clean': !currentOverlayVisible,
      'PhotoView-Slider__willClose': !visible
    }"
    role="dialog"
    @click.stop
  >
    <view
      class="PhotoView-Slider__Backdrop"
      :class="{
        'PhotoView-Slider__fadeIn': activeAnimation === 1,
        'PhotoView-Slider__fadeOut': activeAnimation === 2
      }"
      :style="{
        background: currentOpacity ? `rgba(0, 0, 0, ${currentOpacity})` : undefined,
        transitionTimingFunction: currentEasing,
        transitionDuration: `${state.touched ? 0 : currentSpeed}ms`,
        animationDuration: `${currentSpeed}ms`
      }"
      @animationend="onAnimationEnd"
    >
      <ImageBox
        :src="src"
        :speed="currentSpeed"
        :easing="currentEasing"
        :visible="visible"
        @mask-tap="handlePhotoTap"
        @expose="updateState"
        @on-reach-up="handleReachUp"
        @on-photo-tap="handlePhotoTap"
        @on-reach-move="handleReachMove"
      />
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import useAnimationVisible from './hooks/useAnimationVisible'
import { defaultOpacity, defaultEasing, defaultSpeed, horizontalOffset } from './variables'
import ImageBox from './ImageBox.vue'
import { limitNumber } from './utils/limitTarget'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  images: {
    type: Array,
    default: () => []
  },
  index: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

const state = reactive({
  x: 0,
  touched: false,
  pause: false,
  lastCX: undefined,
  lastCY: undefined,
  bg: undefined,
  lastBg: undefined,
  overlay: true,
  minimal: true,
  scale: 1,
  rotate: 0
})
// 内部虚拟 index
const virtualIndexRef = ref(props.index)

function updateState (payload) {
  Object.assign(state, payload)
}

const src = computed(() => props.images[props.index])

const innerVisible = computed(() => props.visible)

// 显示动画处理
const { realVisible, activeAnimation, onAnimationEnd } = useAnimationVisible(innerVisible)

const currentOverlayVisible = computed(() => !activeAnimation.value)

// 关闭过程中使用下拉保存的透明度
const currentOpacity = computed(() => props.visible ? state.bg : state.lastBg)
// 动画时间
const currentSpeed = defaultSpeed
const currentEasing = defaultEasing

function handlePhotoTap () {
  close()
}

// 关闭
function close () {
  state.lastBg = state.bg
  emit('close')
}

const maskOpacity = defaultOpacity

function handleReachVerticalMove (clientY, nextScale) {
  if (state.lastCY === undefined) {
    updateState({
      touched: true,
      lastCY: clientY,
      bg: maskOpacity,
      minimal: true
    })
    return
  }
  const opacity =
      maskOpacity === null ? null : limitNumber(maskOpacity, 0.01, maskOpacity - Math.abs(clientY - state.lastCY) / 100 / 4)

  updateState({
    touched: true,
    lastCY: state.lastCY,
    bg: nextScale === 1 ? opacity : maskOpacity,
    minimal: nextScale === 1
  })
}

function handleReachHorizontalMove (clientX) {
  if (state.lastCX === undefined) {
    updateState({
      touched: true,
      lastCX: clientX,
      x: state.x,
      pause: false
    })
    return
  }
  const originOffsetClientX = clientX - state.lastCX
  let offsetClientX = originOffsetClientX

  // 第一张和最后一张超出距离减半
  if (
    ((props.index === 0 && originOffsetClientX > 0) || (props.index === props.images.length - 1 && originOffsetClientX < 0))
  ) {
    offsetClientX = originOffsetClientX / 2
  }

  updateState({
    touched: true,
    lastCX: state.lastCX,
    x: -(innerWidth + horizontalOffset) * virtualIndexRef.value + offsetClientX,
    pause: false
  })
}

function handleReachMove (reachPosition, clientX, clientY, nextScale) {
  if (reachPosition === 'x') {
    handleReachHorizontalMove(clientX)
  } else if (reachPosition === 'y') {
    handleReachVerticalMove(clientY, nextScale)
  }
}

function handleReachUp (clientX, clientY) {
  const offsetClientX = clientX - (state.lastCX === null || state.lastCX === undefined ? clientX : state.lastCX)
  const offsetClientY = clientY - (state.lastCY === null || state.lastCY === undefined ? clientY : state.lastCY)
  let willClose = false
  // 下一张

  // 上一张

  const singlePageWidth = innerWidth + horizontalOffset

  // 当前偏移
  const currentTranslateX = -singlePageWidth * virtualIndexRef.value
  if (Math.abs(offsetClientY) > 100 && state.minimal) {
    willClose = true
    close()
  }

  updateState({
    touched: false,
    x: currentTranslateX,
    lastCX: undefined,
    lastCY: undefined,
    bg: defaultOpacity,
    overlay: willClose ? true : state.overlay
  })
}

</script>

<style lang="less" scoped>
.PhotoView-Portal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  overflow: hidden;
  touch-action: none;
  .PhotoView-Slider__Backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000000;
    transition-property: background-color;
    z-index: -1;
  }
  .PhotoView-Slider__fadeIn {
    opacity: 0;
    animation: PhotoView__fade linear both;
  }
  .PhotoView-Slider__fadeOut {
    opacity: 0;
    animation: PhotoView__fade linear both reverse;
  }
}

@keyframes PhotoView__fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
