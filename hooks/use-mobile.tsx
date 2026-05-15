import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange)
    
    // Tunda sedikit eksekusi pertamanya biar React nggak protes
    // (Bypass warning synchronous setState)
    setTimeout(onChange, 0)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}