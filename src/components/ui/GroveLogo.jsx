export function GroveLogo({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M 50 10 C 80 10, 100 35, 100 70 C 100 90, 85 105, 60 105 C 35 105, 15 90, 15 65 C 15 35, 30 10, 50 10 Z" fill="#5FB88A" />
      <path d="M 50 10 C 80 10, 100 35, 100 70 C 100 90, 85 105, 60 105 L 55 60 L 50 10 Z" fill="#7DCDA3" />
      <path d="M 40 80 L 55 60 L 65 70 L 82 42" stroke="#0A0E0B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 75 40 L 82 42 L 80 49" stroke="#0A0E0B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
