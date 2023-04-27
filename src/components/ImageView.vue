<template>
  <view
    ref="originRef"
    @click="show"
  >
    <slot />
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  uniqueId: {
    type: [String, Number],
    default: -1
  }
})
const emit = defineEmits(['show'])

const originRef = ref()

function show () {
  emit('show', props.uniqueId)
}
</script>
