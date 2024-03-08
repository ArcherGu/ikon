<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="h-full w-full flex-center">
    <div class="flex flex-col items-center">
      <img src="@src/assets/lightwing-vue.png" class="logo" alt="Lightwing x Vue">
      <HelloWorld />
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 150px;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #5fc2d1aa);
}
</style>
