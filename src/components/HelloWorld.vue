<template>
  <div class="tech-list">
    <div class="tech-list-item">
      <i-logos-vitejs />
      <span>
        Run and build powered by
        <a href="https://vitejs.dev/" target="_blank">Vite</a>
      </span>
    </div>

    <div class="tech-list-item">
      <i-logos-unocss />
      <span>
        Atomic styles powered by
        <a href="https://unocss.dev/" target="_blank">UnoCSS</a>
      </span>
    </div>

    <div class="tech-list-item">
      <i-simple-icons-iconify style="color:#1769aa" />
      <span>
        Full icons powered by
        <a href="https://iconify.design/" target="_blank">Iconify</a>
      </span>
    </div>

    <div class="tech-list-item">
      <i-logos-eslint />
      <span>
        Generic
        <a href="https://github.com/ArcherGu/lightwing/tree/main/packages/eslint-config/" target="_blank">eslint rules</a>
      </span>
    </div>
  </div>
</template>

<style>
.tech-list .tech-list-item {
  @apply flex items-center text-20px mb-10px;
}

.tech-list .tech-list-item span {
  @apply ml-5px;
}

.tech-list .tech-list-item a {
  @apply text-blue-500 underline-transparent;
  @apply hover:underline-current;
  transition: all 0.3s;
}
</style>
