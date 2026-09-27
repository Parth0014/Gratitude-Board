type BrandMarkProps = {
  className?: string;
};

/** Four open petals represent attention, possibility, and a growing vision. */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 40 40"
    >
      <path
        d="M20 19C11.3 17.9 7 13.5 7 8c6.3 0 10.8 4.4 13 11Zm1 0c1.1-8.7 5.5-13 11-13 0 6.3-4.4 10.8-11 13Zm0 2c8.7 1.1 13 5.5 13 11-6.3 0-10.8-4.4-13-11Zm-2 0c-1.1 8.7-5.5 13-11 13 0-6.3 4.4-10.8 11-13Z"
        fill="currentColor"
        fillOpacity=".78"
      />
      <circle cx="20" cy="20" r="3" fill="currentColor" />
    </svg>
  );
}
