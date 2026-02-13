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

    document.documentElement.classList.add('custom-scrollbar-active');
    document.body.classList.add('custom-scrollbar-active');

    return () => {
      document.documentElement.classList.remove('custom-scrollbar-active');
      document.body.classList.remove('custom-scrollbar-active');
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    let rafId = 0;
    let trackHeight = 0;
    let lastThumbH = -1;
    let lastThumbTop = -1;
    let lastHidden = null;

    const measureTrack = () => {
      if (!trackRef.current) return;
      trackHeight = trackRef.current.getBoundingClientRect().height;
    };

    const update = () => {
      rafId = 0;
      if (!trackRef.current || !thumbRef.current) return;

      const { scrollHeight, clientHeight, scrollTop } = document.documentElement;
      const shouldHide = scrollHeight <= clientHeight || trackHeight <= 0;

      if (lastHidden !== shouldHide) {
        thumbRef.current.style.display = shouldHide ? 'none' : 'block';
        lastHidden = shouldHide;
      }
      if (shouldHide) return;

      const thumbH = Math.max((clientHeight / scrollHeight) * trackHeight, 40);
      const maxScroll = scrollHeight - clientHeight;
      const maxThumb = trackHeight - thumbH;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      const thumbTop = progress * maxThumb;

      // Avoid needless style churn during scroll
      if (Math.abs(thumbH - lastThumbH) > 0.5) {
        thumbRef.current.style.height = `${thumbH}px`;
        lastThumbH = thumbH;
      }
      if (Math.abs(thumbTop - lastThumbTop) > 0.5) {
        thumbRef.current.style.transform = `translateY(${thumbTop}px)`;
        lastThumbTop = thumbTop;
      }
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    measureTrack();
    scheduleUpdate();

    const onResize = () => {
      measureTrack();
      scheduleUpdate();
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', onResize);

    // Track height changes (e.g., viewport changes)
    const trackObserver = new ResizeObserver(() => {
      measureTrack();
      scheduleUpdate();
    });
    if (trackRef.current) trackObserver.observe(trackRef.current);

    // Content changes can affect scrollHeight
    const contentObserver = new ResizeObserver(scheduleUpdate);
    contentObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', onResize);
      trackObserver.disconnect();
      contentObserver.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;
    
    let startY = 0;
    let startScrollTop = 0;
    let scrollRatio = 0;
    let isDragging = false;

    const onMouseDown = (e) => {
      e.preventDefault(); // Prevent text selection
      isDragging = true;
      startY = e.clientY;
      startScrollTop = document.documentElement.scrollTop;

      // Cache drag math to avoid layout reads in mousemove
      const { scrollHeight, clientHeight } = document.documentElement;
      const trackHeight = trackRef.current?.getBoundingClientRect().height ?? 0;
      const thumbHeight = thumbRef.current?.getBoundingClientRect().height ?? 0;
      const maxScroll = scrollHeight - clientHeight;
      const maxThumb = trackHeight - thumbHeight;
      scrollRatio = maxThumb > 0 ? maxScroll / maxThumb : 0;

      document.body.style.userSelect = 'none';
      if (thumbRef.current) thumbRef.current.classList.add('brightness-90');
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;

      if (!scrollRatio) return;
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
      className="fixed right-0 top-0 bottom-0 w-6 z-[9995] bg-white"
    >
      <div 
        ref={thumbRef}
        className="w-full rounded-full bg-accent border-4 border-white transition-filter duration-200"
        style={{ position: 'absolute', right: 0 }}
      />
    </div>
  );
}
