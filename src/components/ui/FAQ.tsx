'use client';

import { motion } from 'framer-motion';

export interface FAQItem { q: string; a: string }

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"
    >
      <div className="space-y-3 sm:space-y-4">
        {items.map((item, idx) => (
          <motion.details
            key={idx}
            variants={itemVariants}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.4)] backdrop-blur-sm transition-colors hover:border-sky-200 sm:p-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <span className="text-base font-semibold text-slate-900 sm:text-lg">{item.q}</span>
              <span className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden>
                ⌄
              </span>
            </summary>
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-2 text-sm text-slate-600 sm:mt-3 sm:text-base"
            >
              {item.a}
            </motion.p>
          </motion.details>
        ))}
      </div>
    </motion.div>
  );
}
