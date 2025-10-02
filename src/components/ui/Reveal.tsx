'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { CSSProperties, PropsWithChildren } from 'react';

type RevealElement = 'div' | 'section' | 'article';

type RevealProps = PropsWithChildren<{
  as?: RevealElement;
  delay?: number;
  className?: string;
  id?: string;
  style?: CSSProperties;
}>;

export function Reveal({ as = 'div', delay = 0, className, children, id, style }: RevealProps) {
  const MotionComponent = motion(as);

  return (
    <MotionComponent
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.2 }}
      className={clsx(className)}
      id={id}
      style={style}
    >
      {children}
    </MotionComponent>
  );
}
