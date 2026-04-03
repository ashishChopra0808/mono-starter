import preset from '@mono/config-tailwind/preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    '../../packages/ui-web/src/**/*.{ts,tsx}',
  ],
};
