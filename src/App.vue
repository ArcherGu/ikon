<script setup lang="ts">
import { unrefElement, useDropZone, useFileDialog } from '@vueuse/core'
import { onUnmounted, ref, watch } from 'vue'
import { IkonEditor } from '@src/core'
import type { IconBackground } from '@src/core/types'
import logo from '@src/assets/ikon.png'

let editor: IkonEditor
onUnmounted(() => {
  editor?.destroy()
})

const hasImage = ref(false)
const editorRef = ref<HTMLDivElement>()
watch(
  editorRef,
  () => {
    const el = unrefElement(editorRef)
    if (!el)
      return
    editor = new IkonEditor(el)

    editor.onImagesCountChange((c) => {
      hasImage.value = c > 0
    })
  },
  { flush: 'post' },
)

function onDrop(files: File[] | null) {
  if (files)
    editor?.addImage(files[0])
}

const imgDropZone = ref<HTMLDivElement>()
useDropZone(imgDropZone, {
  onDrop,
  dataTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
})

const {
  open: openFile,
  reset,
  onChange,
} = useFileDialog({
  accept: 'image/*',
  directory: false,
})

onChange((files) => {
  if (files) {
    editor?.addImage(files[0])
    reset()
  }
})

const iconBg = ref<IconBackground>({
  visible: false,
  color: '#ffffff',
  radius: 20,
})
watch(iconBg, (value) => {
  editor?.updateIconBg(value)
}, { deep: true })
</script>

<template>
  <div class="h-full w-full flex flex-col items-center">
    <div class="logo-plane mt-100px">
      <img :src="logo" alt="ikon" class="w-100px">
      <div class="text-80px text-gray-500 ml-10px">
        <span class="text-cyan-500">i</span>
        <span>k</span>
        <span class="text-amber-600">o</span>
        <span>n</span>
      </div>
    </div>
    <div class="flex items-start">
      <div class="left-plane">
        <div class="icon-bg-ctrl">
          <el-checkbox v-model="iconBg.visible" label="Icon Background" />
          <div v-if="iconBg.visible" class="pl-25px">
            <div class="flex items-center">
              <span class="ctrl-label">Color:</span>
              <el-color-picker v-model="iconBg.color" />
              <span class="text-gray-500 ml-5px">[{{ iconBg.color }}]</span>
            </div>

            <div class="flex items-center">
              <span class="ctrl-label">Radius:</span>
              <el-slider v-model="iconBg.radius" :step="1" :min="0" :max="50" :show-tooltip="false" />
              <span class="text-gray-500 ml-15px">[{{ `${iconBg.radius}%` }}]</span>
            </div>
          </div>
        </div>
      </div>
      <div ref="imgDropZone" class="center-plane">
        <div v-show="!hasImage" class="img-select-zone" @click="() => openFile()">
          <i-fluent-add-12-regular class="text-60px" />
          <span class="text-24px">select or drop icon here</span>
        </div>

        <div ref="editorRef" class="img-editor" />
      </div>

      <div class="right-plane" />
    </div>
  </div>
</template>

<style scoped>
.logo-plane {
  @apply flex items-center justify-center h-150px;
}

.ctrl-label {
  @apply text-gray-500 mr-15px;
}

.left-plane {
  @apply w-250px flex flex-col justify-center items-start;
}

.icon-bg-ctrl .el-slider {
  @apply w-100px;
}

.center-plane {
  @apply w-350px h-350px relative;
}

.right-plane {
  @apply w-250px flex flex-col justify-center items-start;
}

.img-select-zone {
  @apply w-full h-full border-dashed border-2 border-gray-400 rounded-lg text-gray-400 cursor-pointer box-border;
  @apply flex flex-col justify-center items-center;
  @apply hover:border-gray-500 hover:text-gray-500;
  @apply transition-all duration-300 ease-linear;
  @apply absolute top-0 left-0 z-10;
}

.img-editor {
  @apply w-full h-full;
}
</style>
