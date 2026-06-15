'use client';

import ScrollReveal from '@/components/ui/ScrollReveal';

export default function ScrollRevealWrapper({ children, ...props }) {
  return <ScrollReveal {...props}>{children}</ScrollReveal>;
}
