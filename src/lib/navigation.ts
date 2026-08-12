export const isNavigationActive = (pathname: string, href: string): boolean => {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
};

export const closeNavigationMenu = (menu: { open: boolean } | null): void => {
  if (menu) menu.open = false;
};
