export function SiteChrome({children,header,footer}:{children:React.ReactNode;header:React.ReactNode;footer:React.ReactNode}){return <>{header}<main>{children}</main>{footer}</>}
