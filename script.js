const starField = document.querySelector(".star-field");
const revealItems = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (starField) {
  const fragment = document.createDocumentFragment();
  const starCount = 36;

  for (let index = 0; index < starCount; index += 1) {
    const star = document.createElement("span");
    const size = (Math.random() * 2.4 + 1).toFixed(2);
    const alpha = (Math.random() * 0.5 + 0.2).toFixed(2);
    const twinkle = `${(Math.random() * 4 + 4).toFixed(2)}s`;
    const drift = `${(Math.random() * 8 + 10).toFixed(2)}s`;
    const delay = `${(Math.random() * -10).toFixed(2)}s`;

    star.className = "star";
    star.style.setProperty("--size", `${size}px`);
    star.style.setProperty("--left", `${(Math.random() * 100).toFixed(2)}%`);
    star.style.setProperty("--top", `${(Math.random() * 100).toFixed(2)}%`);
    star.style.setProperty("--alpha", alpha);
    star.style.setProperty("--twinkle-duration", twinkle);
    star.style.setProperty("--drift-duration", drift);
    star.style.setProperty("--delay", delay);
    fragment.appendChild(star);
  }

  starField.appendChild(fragment);
}

if (!("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

const carousels = document.querySelectorAll("[data-carousel]");

carousels.forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const dotsContainer = carousel.querySelector("[data-dots]");
  const prevButton = carousel.querySelector('[data-action="prev"]');
  const nextButton = carousel.querySelector('[data-action="next"]');
  const currentIndex = carousel.querySelector("[data-current-index]");
  const totalCount = carousel.querySelector("[data-total-count]");
  const dots = [];
  let activeIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.classList.contains("is-active"))
  );
  let autoplayId = null;

  const formatNumber = (value) => String(value + 1).padStart(2, "0");

  if (totalCount) {
    totalCount.textContent = String(slides.length).padStart(2, "0");
  }

  const setActiveSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });

    if (currentIndex) {
      currentIndex.textContent = formatNumber(activeIndex);
    }
  };

  const stopAutoplay = () => {
    if (autoplayId !== null) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  };

  const startAutoplay = () => {
    if (prefersReducedMotion || slides.length < 2) {
      return;
    }

    stopAutoplay();
    autoplayId = window.setInterval(() => {
      setActiveSlide(activeIndex + 1);
    }, 4800);
  };

  slides.forEach((slide, index) => {
    const memoryNumber = slide.querySelector(".memory-number");

    slide.setAttribute("aria-hidden", String(index !== activeIndex));

    if (memoryNumber) {
      memoryNumber.textContent = `${formatNumber(index)} / ${String(slides.length).padStart(2, "0")}`;
    }

    if (!dotsContainer) {
      return;
    }

    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `切换到第 ${index + 1} 张照片`);
    dot.setAttribute("aria-selected", String(index === activeIndex));
    dot.addEventListener("click", () => {
      setActiveSlide(index);
      startAutoplay();
    });

    dots.push(dot);
    dotsContainer.appendChild(dot);
  });

  prevButton?.addEventListener("click", () => {
    setActiveSlide(activeIndex - 1);
    startAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    setActiveSlide(activeIndex + 1);
    startAutoplay();
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", startAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  setActiveSlide(activeIndex);
  startAutoplay();
});
