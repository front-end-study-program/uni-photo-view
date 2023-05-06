<template>
  <ImageView
    v-for="(item, idx) in state.images"
    :key="idx"
    :unique-id="idx"
    @show="show"
  >
    <image
      mode="aspectFill"
      class="image"
      :src="item"
    />
  </ImageView>

  <ImagePreview
    :images="state.images"
    :visible="state.visible"
    :index="state.index"
    @close="state.visible = false"
  />
</template>

<script setup>
import { reactive } from 'vue'
import ImageView from '@/components/ImageView.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import image1 from '@/static/5.jpg'

const state = reactive({
  images: [image1],
  visible: false,
  index: 0
})

function show (uniqueId) {
  state.index = uniqueId
  state.visible = true
}

</script>

<style lang="less" scoped>
.image {
  width: 400rpx;
  height: 400rpx;
}
</style>
