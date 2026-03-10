import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { SEO } from '@/components/SEO';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface AnimatedPageProps {
  children: ReactNode;
  seo?: {
    title: string;
    description: string;
    path: string;
  };
}

export default function AnimatedPage({ children, seo }: AnimatedPageProps) {
  return (
    <>
      {seo && <SEO title={seo.title} description={seo.description} path={seo.path} />}
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-full"
      >
        {children}
      </motion.div>
    </>
  );
}
