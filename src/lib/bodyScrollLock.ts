let lockCount = 0;
let originalOverflow = "";

// Nested dialogs can unmount in either order (for example, at a breakpoint).
// Restore the page only after the last overlay releases its lock.
export function lockBodyScroll() {
  if (lockCount === 0) originalOverflow = document.body.style.overflow;
  lockCount += 1;
  document.body.style.overflow = "hidden";
  let released = false;

  return () => {
    if (released) return;
    released = true;
    lockCount -= 1;
    if (lockCount === 0) document.body.style.overflow = originalOverflow;
  };
}
