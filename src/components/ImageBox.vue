<template>
  <view
    class="PhotoView__PhotoWrap"
    @touchstart="(e) => handleMaskStart(e.touches[0])"
    @touchend="onTouchend"
  >
    <view
      class="PhotoView__PhotoBox"
      :style="{
        transform: `matrix()`,
        transition: state.touched || state.pause ? undefined : transitionCSS,
        willChange: 'transform'
      }"
    >
      <view @touchstart="handleTouchStart">
        <img
          class="PhotoView__Photo"
          :src="src"
          @load="handleImageLoaded"
        >
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import getSuitableImageSize from './utils/getSuitableImageSize'
import getMultipleTouchPosition from './utils/getMultipleTouchPosition'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  speed: {
    type: Number,
    default: 0
  },
  easing: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['maskTap'])

const state = reactive({
  // 真实宽度
  naturalWidth: undefined,
  // 真实高度
  naturalHeight: undefined,
  // 加载成功状态
  loaded: undefined,

  // 图片 X 偏移量
  x: 0,
  // 图片 y 偏移量
  y: 0,
  // 图片处于触摸的状态
  touched: false,
  // 背景处于触摸状态
  maskTouched: false,
  // 旋转状态
  rotate: 0,
  // 放大缩小
  scale: 1,

  // 触摸开始时 x 原始坐标
  CX: 0,
  // 触摸开始时 y 原始坐标
  CY: 0,

  // 触摸开始时图片 x 偏移量
  lastX: 0,
  // 触摸开始时图片 y 偏移量
  lastY: 0,
  // 上一个触摸状态 x 原始坐标
  lastCX: 0,
  // 上一个触摸状态 y 原始坐标
  lastCY: 0,
  // 上一个触摸状态的 scale
  lastScale: 1,

  // 触摸开始时时间
  touchTime: 0,
  // 多指触控间距
  touchLength: 0,
  // 是否暂停 transition
  pause: true
})
const initialTouchRef = ref(0)

const transitionCSS = `transform ${props.speed}ms ${props.easing}`

function handleMaskStart (e) {
  console.log(e)
  state.maskTouched = true
  state.CX = e.clientX
  state.CY = e.clientY
  state.lastX = state.x
  state.lastY = state.y
}

function onTouchend ({ changedTouches }) {
  const touch = changedTouches[0]
  handleUp(touch.clientX, touch.clientY)
}

function handleUp (nextClientX, nextClientY) {
  // 重置响应状态
  initialTouchRef.value = 0
  const { touched, maskTouched, CX, CY } = state
  if (touched || maskTouched) {
    state.touched = false
    state.maskTouched = false
    // 触发 Tap 事件
    if (CX === nextClientX && CY === nextClientY) {
      if (maskTouched) {
        emit('maskTap', nextClientX, nextClientY)
      }
    }
  }
}

function handlePhotoLoad (params) {
  Object.assign(state, params, {
    ...(params.loaded && getSuitableImageSize(params.naturalWidth || 0, params.naturalHeight || 0, state.rotate))
  })
}

function handleTouchStart (e) {
  e.stopPropagation()
  handleStart(...getMultipleTouchPosition(e))
}

function handleStart (currentClientX, currentClientY, currentTouchLength = 0) {
  state.touched = true
  state.CX = currentClientX
  state.CY = currentClientY
  state.lastCX = currentClientX
  state.lastCY = currentClientY
  state.lastX = state.x
  state.lastY = state.y
  state.lastScale = state.scale
  state.touchLength = currentTouchLength
  state.touchTime = Date.now()
}

// img

function handleImageLoaded (e) {
  const { naturalWidth, naturalHeight } = e.target

  handlePhotoLoad({
    loaded: true,
    naturalWidth,
    naturalHeight
  })
}
</script>

<style lang="less" scoped>
.PhotoView__PhotoWrap, .PhotoView__PhotoBox {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  touch-action: none;
  direction: ltr;
}

.PhotoView__Photo {
  max-width: initial;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}
</style>
