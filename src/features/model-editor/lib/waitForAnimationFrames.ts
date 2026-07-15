export function waitForAnimationFrames(
  frameCount: number,
): Promise<void> {
  if (frameCount <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    function waitForNextFrame(
      remainingFrames: number,
    ) {
      requestAnimationFrame(() => {
        if (remainingFrames <= 1) {
          resolve();
          return;
        }

        waitForNextFrame(remainingFrames - 1);
      });
    }

    waitForNextFrame(frameCount);
  });
}
