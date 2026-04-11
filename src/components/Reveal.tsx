import type { ComponentPropsWithoutRef, CSSProperties, ElementType, PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';

type RevealProps<T extends ElementType> = PropsWithChildren<{
  as?: T;
  className?: string;
  delay?: number;
}> &
  Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export const Reveal = <T extends ElementType = 'div'>({
  as,
  className = '',
  delay = 0,
  children,
  style,
  ...rest
}: RevealProps<T>) => {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    const element = ref.current;

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const Tag = (as ?? 'div') as ElementType;

  return (
    <Tag
      ref={ref}
      className={`reveal ${isVisible ? 'reveal-visible' : ''} ${className}`.trim()}
      style={{ ...(style as CSSProperties), '--reveal-delay': `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
};
