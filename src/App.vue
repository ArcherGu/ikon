<script setup lang="ts">
import { unrefElement, useDropZone, useFileDialog } from '@vueuse/core'
import { onBeforeMount, onUnmounted, ref, watch } from 'vue'
import { IkonEditor } from '@src/core'
import type { IconBackground } from '@src/core/types'
import logo from '@src/assets/ikon.png'
import { CustomSizes, type Platform, Platforms } from '@src/core/platforms'

let editor: IkonEditor
onUnmounted(() => {
  editor?.destroy()
})

const iconBg = ref<IconBackground>({
  visible: true,
  color: '#ffffff',
  radius: 20,
})
watch(iconBg, (value) => {
  editor?.updateIconBg(value)
}, { deep: true })

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

    editor.updateIconBg(iconBg.value)
  },
  { flush: 'post' },
)

function onDrop(files: File[] | null) {
  if (files) {
    files.forEach((file) => {
      editor?.addImage(file)
    })
  }
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
    Array.from(files).forEach((file) => {
      editor?.addImage(file)
    })
    reset()
  }
})

const customSizes = ref<number[]>([])
const platform = ref<Platform[]>([])
onBeforeMount(() => {
  for (const p of Platforms)
    platform.value.push(p)
})

const generateLoading = ref(false)
async function generateAndDownload() {
  generateLoading.value = true
  try {
    await editor?.generateAndDownload(platform.value, customSizes.value)
  }
  catch (error) {
    console.error(error)
  }
  finally {
    generateLoading.value = false
  }
}
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
    <div class="flex items-center text-gray-500 justify-center mb-20px -mt-10px">
      an easy icon editor and generator
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

      <div class="right-plane pl-20px box-border">
        <div class="ctrl-label">
          Platform:
        </div>
        <div>
          <el-checkbox-group v-model="platform">
            <el-checkbox v-for="p in Platforms" :key="p" :label="p" :value="p" />
          </el-checkbox-group>
        </div>

        <div class="ctrl-label mt-10px">
          Custom Size:
        </div>
        <div>
          <el-checkbox-group v-model="customSizes">
            <el-checkbox v-for="s in CustomSizes" :key="s" :label="`${s}x${s}`" :value="s" />
          </el-checkbox-group>
        </div>
      </div>
    </div>
    <div class="action-plane">
      <el-button
        size="large" type="success" :disabled="!hasImage" :loading="generateLoading"
        @click="generateAndDownload"
      >
        Generate & Download
      </el-button>
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

.action-plane {
  @apply flex items-end justify-center h-100px;
}
</style>
