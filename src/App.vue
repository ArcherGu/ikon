<script setup lang="ts">
import { unrefElement, useDropZone, useFileDialog } from '@vueuse/core'
import { onUnmounted, ref, watch } from 'vue'
import { IkonEditor } from '@src/core'

const imgFileZone = ref<HTMLDivElement>()
const file = ref<File | null>(null)
function onDrop(files: File[] | null) {
  if (files)
    file.value = files[0]
}

useDropZone(imgFileZone, {
  onDrop,
  dataTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
})

const { open: openFile, reset, onChange } = useFileDialog({
  accept: 'image/*',
  directory: false,
})

onChange((files) => {
  if (files)
    file.value = files[0]
})

function restFile() {
  file.value = null
  reset()
}

// Editor
const editorRef = ref<HTMLDivElement>()
let editor: IkonEditor

watch(editorRef, () => {
  const el = unrefElement(editorRef)
  if (!el)
    return
  editor = new IkonEditor(el)
}, { flush: 'post' })

onUnmounted(() => {
  editor?.destroy()
})

watch(file, (file) => {
  if (file)
    editor?.addImage(file)
})
</script>

<template>
  <div class="h-full w-full flex-center flex-col">
    <div class="main-block">
      <div v-show="!file" ref="imgFileZone" class="select-drop-block" @click="() => openFile()">
        <i-fluent-add-12-regular class="text-60px" />
        <p>
          select or drop icon here
        </p>
      </div>

      <div ref="editorRef" class="img-editor" />
    </div>

    <el-button v-if="file" class="mt-50px" @click="restFile">
      Rest
    </el-button>
  </div>
</template>

<style scoped>
.main-block {
  @apply w-256px h-256px relative;
}

.select-drop-block {
  @apply w-full h-full border-dashed border-2 border-gray-400 rounded-lg text-gray-400 cursor-pointer;
  @apply flex flex-col justify-center items-center;
  /* @apply bg-black bg-opacity-10; */
  @apply hover:border-gray-500 hover:text-gray-500;
  @apply transition-all duration-300 ease-linear;
  @apply absolute top-0 left-0 z-10;
}

.img-editor {
  @apply w-full h-full;
}
</style>
