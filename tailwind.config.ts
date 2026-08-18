import type { Config } from 'tailwindcss';
export default {content:['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],theme:{extend:{colors:{brand:'rgb(var(--primary) / <alpha-value>)',accent:'rgb(var(--accent) / <alpha-value>)',surface:'rgb(var(--surface) / <alpha-value>)',ink:'rgb(var(--ink) / <alpha-value>)'}}},plugins:[]} satisfies Config;
