import { useEffect, useRef, useState } from 'react';

export default function CustomScrollbar() {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const check = () => setIsDesktop(window.matchMedia('(pointer: fine)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleScroll = () => {
      if (!trackRef.current || !thumbRef.current) return;
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement;
      const trackHeight = trackRef.current.clientHeight;
      
      // If content fits, hide thumb
      if (scrollHeight <= clientHeight) {
        thumbRef.current.style.display = 'none';
        return;
      } else {
        thumbRef.current.style.display = 'block';
      }
      
      const thumbH = Math.max(
        (clientHeight / scrollHeight) * trackHeight,
        40 
      );
      
      const maxScroll = scrollHeight - clientHeight;
      const maxThumb = trackHeight - thumbH;
      const progress = scrollTop / maxScroll;
      const thumbTop = progress * maxThumb;

      thumbRef.current.style.height = `${thumbH}px`;
      thumbRef.current.style.transform = `translateY(${thumbTop}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Use ResizeObserver to detect content changes
    const observer = new ResizeObserver(handleScroll);
    observer.observe(document.body);
    
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer.disconnect();
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;
    
    let startY = 0;
    let startScrollTop = 0;
    let isDragging = false;

    const onMouseDown = (e) => {
      e.preventDefault(); // Prevent text selection
      isDragging = true;
      startY = e.clientY;
      startScrollTop = document.documentElement.scrollTop;
      document.body.style.userSelect = 'none';
      if (thumbRef.current) thumbRef.current.classList.add('brightness-90');
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      const { scrollHeight, clientHeight } = document.documentElement;
      const trackHeight = trackRef.current.clientHeight;
      const thumbHeight = thumbRef.current.clientHeight;
      
      const maxScroll = scrollHeight - clientHeight;
      const maxThumb = trackHeight - thumbHeight;
      
      const scrollRatio = maxScroll / maxThumb;
      const newScroll = startScrollTop + (deltaY * scrollRatio);
      
      window.scrollTo(0, newScroll);
    };

    const onMouseUp = () => {
      isDragging = false;
      document.body.style.userSelect = '';
      if (thumbRef.current) thumbRef.current.classList.remove('brightness-90');
    };

    const thumb = thumbRef.current;
    if (thumb) thumb.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      if (thumb) thumb.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div 
      ref={trackRef}
      className="fixed right-0 top-0 bottom-0 w-6 z-[9995] bg-black"
    >
      <div 
        ref={thumbRef}
        className="w-full rounded-full bg-accent border-4 border-black transition-filter duration-200"
        style={{ position: 'absolute', right: 0 }}
      />
    </div>
  );
}
