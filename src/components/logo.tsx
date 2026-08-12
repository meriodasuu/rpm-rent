import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return <Link className="logo" href="/" aria-label="RPM Rent — на главную"><Image className="logo-image" src="/images/brand/rpm-white.png" alt="RPM Rent" width={180} height={54} priority /></Link>;
}
