export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function animateScrollLeft(element: Element, target: number, duration: number) {
  let start = element.scrollLeft;
  let startTime = performance.now();
  let distance = target - start;

  function scrollStep(currentTime: number) {
    let elapsed = currentTime - startTime;
    let progress = Math.min(elapsed / duration, 1); // Clamp progress between 0 and 1
    let easedProgress = easeInOutQuad(progress); // Apply easing

    element.scrollLeft = start + distance * easedProgress;

    if (progress < 1) {
      requestAnimationFrame(scrollStep);
    }
  }

  requestAnimationFrame(scrollStep);
}
