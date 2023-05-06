<template>
  <view
    class="PhotoView__PhotoWrap"
    @touchstart="(e) => handleMaskStart(e.touches[0])"
    @touchmove="onTouchmove"
    @touchend="onTouchend"
  >
    <view
      class="PhotoView__PhotoBox"
      :style="{
        transform: `matrix(${currentScale}, 0, 0, ${currentScale}, ${translateX}, ${translateY})`,
        transition: state.touched || state.pause ? undefined : transitionCSS,
        willChange: 'transform'
      }"
    >
      <view
        @touchstart="handleTouchStart"
      >
        <img
          :style="{
            width: currentWidth + 'px',
            height: currentHeight + 'px',
          }"
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
import useAnimationPosition from './hooks/useAnimationPosition'
import { minStartTouchOffset, scaleBuffer } from './variables'
import { computePositionEdge, getReachType } from './utils/edgeHandle'
import getPositionOnMoveOrScale from './utils/getPositionOnMoveOrScale'
import { limitScale } from './utils/limitTarget'
import useScrollPosition from './hooks/useScrollPosition'
import useContinuousTap from './hooks/useContinuousTap'
import useDebounceCallback from './hooks/useDebounceCallback'

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
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['maskTap', 'expose', 'onReachUp', 'onPhotoTap', 'onReachMove'])

const state = reactive({
  // 真实宽度
  naturalWidth: undefined,
  // 真实高度
  naturalHeight: undefined,
  // 宽度
  width: undefined,
  // 高度
  height: undefined,
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
  pause: true,
  // 停止 Raf
  stopRaf: true,
  // 当前边缘触发状态
  reach: undefined
})
const initialTouchRef = ref(0)

const transitionCSS = `transform ${props.speed}ms ${props.easing}`

function handleMaskStart (e) {
  state.maskTouched = true
  state.CX = e.clientX
  state.CY = e.clientY
  state.lastX = state.x
  state.lastY = state.y
}

// 默认为屏幕中心缩放
function onScale (current, clientX, clientY) {
  if (state.scale !== current) {
    emit('expose', {
      scale: current
    })
    const { x, y, width, height, scale } = state
    Object.assign(state, {
      scale: current,
      ...getPositionOnMoveOrScale(x, y, width, height, scale, current, clientX, clientY),
      ...(current <= 1 && { x: 0, y: 0 })
    })
  }
}

const handleMove = useDebounceCallback((nextClientX, nextClientY, currentTouchLength) => {
  const { touched, maskTouched, CX, CY, lastCX, lastCY, lastX, lastY, scale, reach, x, y, width, height, naturalWidth, touchLength } = state
  if (touched || maskTouched) {
    // 单指最小缩放下，以初始移动距离来判断意图
    if (currentTouchLength === 0 && initialTouchRef.value === 0) {
      const isStillX = Math.abs(nextClientX - CX) <= minStartTouchOffset
      const isStillY = Math.abs(nextClientY - CY) <= minStartTouchOffset
      // 初始移动距离不足
      if (isStillX && isStillY) {
        // 方向记录上次移动距离，以便平滑过渡
        state.lastCX = nextClientX
        state.lastCY = nextClientY
        return
      }
      // 设置响应状态
      initialTouchRef.value = !isStillX ? 1 : nextClientY > CY ? 3 : 2
    }
    const offsetX = nextClientX - lastCX
    const offsetY = nextClientY - lastCY
    // 边缘触发状态
    let currentReach
    if (currentTouchLength === 0) {
      // 边缘超出状态
      const [horizontalCloseEdge] = computePositionEdge(offsetX + lastX, scale, currentWidth.value, innerWidth)
      const [verticalCloseEdge] = computePositionEdge(offsetY + lastY, scale, currentHeight.value, innerHeight)
      // 边缘触发检测
      currentReach = getReachType(initialTouchRef.value, horizontalCloseEdge, verticalCloseEdge, reach)

      // 接触边缘
      if (currentReach !== undefined) {
        emit('onReachMove', currentReach, nextClientX, nextClientY, scale)
      }
    }
    // 横向边缘触发、背景触发禁用当前滑动
    if (currentReach === 'x' || maskTouched) {
      state.reach = 'x'
      return
    }

    // 目标倍数
    const toScale = limitScale(
      scale + ((currentTouchLength - touchLength) / 100 / 2) * scale,
      naturalWidth / width,
      scaleBuffer
    )

    // 导出变量
    emit('expose', { scale: toScale })

    Object.assign(state, {
      touchLength: currentTouchLength,
      reach: currentReach,
      scale: toScale,
      ...getPositionOnMoveOrScale(x, y, width, height, scale, scale, nextClientX, nextClientY, offsetX, offsetY)
    })
  }
}, { maxWait: 8 })

function onTouchmove (e) {
  e.preventDefault()
  const position = getMultipleTouchPosition(e)
  handleMove(...position)
}

function onTouchend ({ changedTouches }) {
  const touch = changedTouches[0]
  handleUp(touch.clientX, touch.clientY)
}

function updateRaf (position) {
  if (state.stopRaf || state.touched) {
    return false
  }
  // 下拉关闭时可以有动画
  Object.assign(state, {
    ...position,
    pause: props.visible
  })
  return true
}

const slideToPosition = useScrollPosition(
  (nextX) => updateRaf({ x: nextX }),
  (nextY) => updateRaf({ y: nextY }),
  (nextScale) => {
    emit('expose', { scale: nextScale })
    state.scale = nextScale
    return !state.touched
  }
)

const handlePhotoTap = useContinuousTap(() => emit('onPhotoTap'), (currentClientX, currentClientY) => {
  if (!state.reach) {
    // 若图片足够大，则放大适应的倍数
    const endScale = state.scale !== 1 ? 1 : Math.max(2, state.naturalWidth / state.width)
    onScale(endScale, currentClientX, currentClientY)
  }
})

function handleUp (nextClientX, nextClientY) {
  // 重置响应状态
  initialTouchRef.value = 0
  const { touched, maskTouched, CX, CY, scale, naturalWidth, width, x, y, lastX, lastY, height, lastScale, rotate, touchTime } = state
  if (touched || maskTouched) {
    state.touched = false
    state.maskTouched = false
    state.pause = false
    state.stopRaf = false
    state.reach = undefined
    const safeScale = limitScale(scale, naturalWidth / width)

    slideToPosition(x, y, lastX, lastY, width, height, scale, safeScale, lastScale, rotate, touchTime)

    emit('onReachUp', nextClientX, nextClientY)
    // 触发 Tap 事件
    if (CX === nextClientX && CY === nextClientY) {
      if (touched) {
        handlePhotoTap(nextClientX, nextClientY)
        return
      }
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

// 计算位置
const [translateX, translateY, currentWidth, currentHeight, currentScale] = useAnimationPosition(state, props.speed)

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

.PhotoView__PhotoBox {
  transform-origin: left top;
}

.PhotoView__Photo {
  max-width: initial;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}
</style>
