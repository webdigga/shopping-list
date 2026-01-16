import { useRef, useCallback, type TouchEvent, type MouseEvent } from 'react'

interface SwipeConfig {
  threshold?: number // Percentage of width to trigger action (0-1)
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

interface SwipeState {
  startX: number
  currentX: number
  isDragging: boolean
}

export function useSwipeGesture({
  threshold = 0.3,
  onSwipeLeft,
  onSwipeRight
}: SwipeConfig) {
  const stateRef = useRef<SwipeState>({
    startX: 0,
    currentX: 0,
    isDragging: false
  })
  const elementRef = useRef<HTMLDivElement>(null)

  const getOffset = useCallback(() => {
    const state = stateRef.current
    return state.currentX - state.startX
  }, [])

  const handleStart = useCallback((clientX: number) => {
    stateRef.current = {
      startX: clientX,
      currentX: clientX,
      isDragging: true
    }
  }, [])

  const handleMove = useCallback((clientX: number) => {
    if (!stateRef.current.isDragging) return

    stateRef.current.currentX = clientX
    const offset = getOffset()

    if (elementRef.current) {
      // Limit the drag distance
      const maxDrag = elementRef.current.offsetWidth * 0.5
      const clampedOffset = Math.max(-maxDrag, Math.min(maxDrag, offset))

      elementRef.current.style.transform = `translateX(${clampedOffset}px)`
      elementRef.current.style.transition = 'none'
    }
  }, [getOffset])

  const handleEnd = useCallback(() => {
    if (!stateRef.current.isDragging || !elementRef.current) return

    const offset = getOffset()
    const width = elementRef.current.offsetWidth
    const percentMoved = Math.abs(offset) / width

    // Reset position with animation
    elementRef.current.style.transition = 'transform 200ms ease-out'
    elementRef.current.style.transform = 'translateX(0)'

    // Check if threshold met
    if (percentMoved >= threshold) {
      if (offset > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (offset < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    stateRef.current.isDragging = false
  }, [getOffset, threshold, onSwipeLeft, onSwipeRight])

  const onTouchStart = useCallback((e: TouchEvent) => {
    handleStart(e.touches[0].clientX)
  }, [handleStart])

  const onTouchMove = useCallback((e: TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }, [handleMove])

  const onTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Mouse events for desktop testing
  const onMouseDown = useCallback((e: MouseEvent) => {
    handleStart(e.clientX)
  }, [handleStart])

  const onMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX)
  }, [handleMove])

  const onMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  const onMouseLeave = useCallback(() => {
    if (stateRef.current.isDragging) {
      handleEnd()
    }
  }, [handleEnd])

  return {
    ref: elementRef,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave
    },
    getOffset
  }
}
