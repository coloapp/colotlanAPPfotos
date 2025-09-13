// Fix: Implementing the Icon component to be used across the application.
import React from 'react';

interface IconProps {
  type: 'product' | 'logo' | 'check' | 'close' | 'wand' | 'save' | 'gallery' | 'square' | 'aspect-ratio-wide' | 'aspect-ratio-tall';
  className?: string;
}

const icons: Record<IconProps['type'], React.ReactNode> = {
  product: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9V3m-9 9h18" />,
  logo: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 0 0 8 11a4 4 0 1 1 8 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0 0 12.002 11c-2.345 0-4.526.395-6.478 1.108c-.29.115-.486.417-.486.745v5.332c0 .328.197.63.487.745A18.498 18.498 0 0 0 12.002 22z" />,
  check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />,
  close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />,
  wand: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 3.104l5.625 5.625a2.25 2.25 0 0 1 0 3.182l-5.625 5.625a2.25 2.25 0 0 1-3.182 0l-5.625-5.625a2.25 2.25 0 0 1 0-3.182l5.625-5.625a2.25 2.25 0 0 1 3.182 0ZM15 7.5h.008v.008H15V7.5Zm-4.5 4.5h.008v.008H10.5v-4.5Zm-4.5 4.5h.008v.008H6v-4.5Z" />,
  save: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338A2.25 2.25 0 0 0 17.088 3.75H15M4.5 18.75h15" />,
  gallery: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />,
  square: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />,
  'aspect-ratio-wide': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15M3.75 20.25h4.5m-4.5 0v-4.5m0 4.5L9 15m11.25-6L15 9" />,
  'aspect-ratio-tall': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m-4.5-4.5L15 9m-1.5 11.25v-4.5m0 4.5h-4.5m4.5 0L9 15m6-11.25L9 9" />,
};

export const Icon: React.FC<IconProps> = ({ type, className = 'w-6 h-6' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      className={className}
      aria-hidden="true"
    >
      {icons[type]}
    </svg>
  );
};
