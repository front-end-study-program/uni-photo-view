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
        @mask-tap="handlePhotoTap"
      />
    </view>
  </view>
</template>

<script setup>
import { computed, reactive } from 'vue'
import useAnimationVisible from './hooks/useAnimationVisible'
import { defaultOpacity, defaultEasing, defaultSpeed } from './variables'
import ImageBox from './ImageBox.vue'

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
  bg: defaultOpacity,
  lastBg: undefined,

  touched: false
})

const src = computed(() => props.images[props.index])

const innerVisible = computed(() => props.visible)

// 显示动画处理
const { realVisible, activeAnimation, onAnimationEnd } = useAnimationVisible(innerVisible)

const currentOverlayVisible = computed(() => !activeAnimation.value)

// 关闭过程中使用下拉保存的透明度
const currentOpacity = computed(() => props.visible ? defaultOpacity : state.lastBg)
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
