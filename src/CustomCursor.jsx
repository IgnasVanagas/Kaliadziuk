import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Direct mouse movement update for instant responsiveness
    const onMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => setClicking(true);
    const onMouseUp = () => setClicking(false);

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
        
      setHovering(!!isInteractive);
    };

    // Reset hovering when leaving interactive elements
    const onMouseOut = (e) => {
      setHovering(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, [isVisible]);

  // Device check
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.matchMedia('(pointer: fine)').matches);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!isDesktop) return null;

  return (
    <div 
      ref={cursorRef} 
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
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
