import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export const TimelineContent = ({ 
  children, 
  as = 'div', 
  className = '', 
  animationNum = 0, 
  customVariants, 
  timelineRef,
  style,
  ...props
}) => {
  const ref = useRef(null);
  
  // Trigger when element enters viewport
  const isInView = useInView(ref, { 
    once: true, 
    margin: '-50px 0px -50px 0px' 
  });

  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      variants={customVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};
