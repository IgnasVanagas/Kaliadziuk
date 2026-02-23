import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const rafRef = useRef(0);
  const latestPosRef = useRef({ x: 0, y: 0 });
  const hoveringRef = useRef(false);
  const clickingRef = useRef(false);
  const visibleRef = useRef(false);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Device check
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const checkDevice = () => {
      // Basic check: if the primary input mechanism is a mouse (fine pointer)
      // or if the device supports hover, it's likely a desktop/laptop context.
      // We avoid checking navigator.maxTouchPoints to support touch-enabled laptops.
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      const canHover = window.matchMedia('(hover: hover)').matches;
      setIsDesktop(hasFinePointer || canHover);
    };

    checkDevice();

    const finePointerMedia = window.matchMedia('(pointer: fine)');
    const hoverMedia = window.matchMedia('(hover: hover)');

    const onMediaChange = () => checkDevice();
    window.addEventListener('resize', checkDevice);
    finePointerMedia.addEventListener?.('change', onMediaChange);
    hoverMedia.addEventListener?.('change', onMediaChange);

    return () => {
      window.removeEventListener('resize', checkDevice);
      finePointerMedia.removeEventListener?.('change', onMediaChange);
      hoverMedia.removeEventListener?.('change', onMediaChange);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const applyPosition = () => {
      rafRef.current = 0;
      if (!cursorRef.current) return;
      const { x, y } = latestPosRef.current;
      cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const schedulePosition = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(applyPosition);
    };

    // Direct mouse movement update for instant responsiveness
    const onMouseMove = (e) => {
      latestPosRef.current = { x: e.clientX, y: e.clientY };
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }
      schedulePosition();
    };

    const onMouseDown = () => {
      if (clickingRef.current) return;
      clickingRef.current = true;
      setClicking(true);
    };

    const onMouseUp = () => {
      if (!clickingRef.current) return;
      clickingRef.current = false;
      setClicking(false);
    };

    // Subtle hover state detection
    const onMouseOver = (e) => {
      const target = e.target;
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.matches('input, textarea, select, label');

      if (hoveringRef.current === Boolean(isInteractive)) return;
      hoveringRef.current = Boolean(isInteractive);
      setHovering(hoveringRef.current);
    };

    // Reset hovering when leaving interactive elements
    const onMouseOut = () => {
      if (!hoveringRef.current) return;
      hoveringRef.current = false;
      setHovering(false);
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div 
      ref={cursorRef} 
      className="pointer-events-none fixed left-0 top-0 z-[2147483647] mix-blend-difference"
      style={{ willChange: 'transform' }}
    >
      <div 
        className={`
          h-3 w-3 -ml-1.5 -mt-1.5 rounded-full bg-[#EEFFCC] 
          transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${clicking ? 'scale-75' : hovering ? 'scale-[2.5]' : 'scale-100'}
        `}
      />
    </div>
  );
}
