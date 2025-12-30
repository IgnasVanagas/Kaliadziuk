import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [clicking, setClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const cursor = cursorRef.current;
    let mouseX = 0, mouseY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);
      
      if (cursor) {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const onMouseDown = (e) => {
      setClicking(true);
      const id = Date.now();
      setRipples(prev => [...prev, { x: e.clientX, y: e.clientY, id }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 1000);
    };

    const onMouseUp = () => setClicking(false);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isVisible]);

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
    <>
      {ripples.map(r => (
        <div
          key={r.id}
          className="fixed pointer-events-none z-[9990] rounded-full bg-accent animate-ping"
          style={{ 
            left: r.x, 
            top: r.y, 
            width: '20px', 
            height: '20px', 
            marginLeft: '-10px', 
            marginTop: '-10px',
            animationDuration: '0.8s',
            animationIterationCount: 1
          }}
        />
      ))}
      <div 
        ref={cursorRef} 
        className={`pointer-events-none fixed left-0 top-0 z-[9999] h-3 w-3 -ml-1.5 -mt-1.5 rounded-full bg-[#EEFFCC] mix-blend-difference transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${clicking ? 'scale-50' : 'scale-100'}`}
      />
    </>
  );
}
