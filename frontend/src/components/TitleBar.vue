<template>
  <section
    class="w-screen h-screen bg-grass text-wordcolor flex flex-col justify-center items-center relative z-10"
  >
    <div id="titleContainer" class="relative">
      <h1 class="text-[200px] font-extrabold bg-clip-text" id="title">
        <span>資</span><span>安</span><span>教</span><span>育</span
        ><span>網</span><span>站</span>
      </h1>
      <h2 class="text-8xl font-semibold opacity-0" id="subtitle">
        <span id="rest-text" class="inline-block">Code Fortress：</span>
        <span id="focus_zi" class="inline-block">資</span>
        <span id="rest-text" class="inline-block">安築城記</span>
      </h2>
    </div>
  </section>
</template>

<script>
import { onMounted } from "vue"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default {
  name: "TitleBar",
  setup() {
    onMounted(() => {
      document.body.style.overflow = "hidden"
      TitleAnimate()
      ZoomInAnimation()
    })

    function TitleAnimate() {
      const title = "#title"
      const subtitle = "#subtitle"
      const spans = document.querySelectorAll(`${title} span`)
      const tl = gsap.timeline()

      gsap.set(title, { opacity: 1 })
      gsap.set(spans, { opacity: 0, x: -50 })

      tl.to(spans, {
        opacity: 0.3,
        color: "#F2F0F0",
        x: 0,
        stagger: 0.3,
        duration: 1,
        ease: "power2.inOut",
      })
        .to(spans, {
          opacity: 0,
          x: 50,
          stagger: 0.3,
          duration: 1,
          ease: "power2.in",
          delay: 0.5,
        })
        .to(spans, {
          opacity: 1,
          color: "var(--tw-text-wordcolor)",
          duration: 1,
          ease: "power2.inOut",
        })
        .to(subtitle, {
          opacity: 1,
          duration: 1,
          delay: 0.3,
        })
        .add(() => {
          document.body.style.overflow = "auto"
        })
    }

    function ZoomInAnimation() {
      const container = "#titleContainer"
      const focusZi = "#focus_zi"

      const ziElement = document.querySelector(focusZi)
      const containerElement = document.querySelector(container)
      const ziRect = ziElement.getBoundingClientRect()
      const containerRect = containerElement.getBoundingClientRect()

      const originX = ziRect.left + ziRect.width / 2 - containerRect.left
      const originY = ziRect.top + ziRect.height / 2 - containerRect.top

      gsap.set(container, { transformOrigin: `${originX}px ${originY}px` })

      gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=1200",
          scrub: true,
          pin: true,
        },
      })
        .to(container, { scale: 350, ease: "power3.inOut" })
        .to(container, { opacity: 0, duration: 0 })
    }
  },
}
</script>
