import Link from "next/link";

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="RPM Rent, на главную">
      <span>RPM</span>
      <small>RENT</small>
    </Link>
  );
}
