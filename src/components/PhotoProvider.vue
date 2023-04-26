
<script lang="ts" setup>
import { reactive, ref, provide } from 'vue'

const props = defineProps(['onVisibleChange', 'onIndexChange'])

const state = reactive({
  images: [],
  visible: false,
  index: 0
})

const uniqueIdRef = ref(0)

const methods = {
  nextId () {
    return (uniqueIdRef.value += 1)
  },
  update (imageItem) {
    const currentIndex = state.images.findIndex((n) => n.key === imageItem.key)
    if (currentIndex > -1) {
      const nextImages = state.images.slice()
      nextImages.splice(currentIndex, 1, imageItem)
      state.images = nextImages
      return
    }
    state.images = [...state.images, imageItem]
  },
  remove (key) {
    const nextImages = state.images.filter((item) => item.key !== key)
    const nextEndIndex = nextImages.length - 1
    state.images = nextImages
    state.index = Math.min(nextEndIndex, state.index)
  },
  show (key) {
    const currentIndex = state.images.findIndex((item) => item.key === key)
    state.visible = true
    state.index = currentIndex
    if (props.onVisibleChange) {
      props.onVisibleChange(true, currentIndex, state)
    }
  }
}

const fn = {
  close () {
    state.visible = false
    if (props.onVisibleChange) {
      props.onVisibleChange(false, state.index, state)
    }
  },
  changeIndex (nextIndex) {
    state.index = nextIndex

    if (props.onIndexChange) {
      props.onIndexChange(nextIndex, state)
    }
  }
}

provide('methods', methods)
provide('state', state)
</script>

<style lang="scss" scoped>

</style>
