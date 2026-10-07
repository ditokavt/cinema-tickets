import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[var(--frame)] px-[var(--footer-pad)] pt-[27px]">
      <div className="flex min-h-[70px] flex-wrap items-start justify-between gap-x-6 gap-y-2 border-t border-raised pb-6 pt-[19px]">
        <Logo size="sm" className="mt-[2px]" />
        <p className="t-body-s mt-[1px] text-secondary">© 2026 Kino XII. All rights reserved.</p>
      </div>
    </footer>
  );
}
