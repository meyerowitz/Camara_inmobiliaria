import { useEffect, useState } from 'react'

export default function useScrollReveal() {
  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add('active')
      },
      { threshold: 0.1 }
    )
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref])

  return setRef
}

