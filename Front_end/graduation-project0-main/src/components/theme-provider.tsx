'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useTranslation } from '@/hooks/useTranslation'

function RTLandLanguageSync({ children }: { children: React.ReactNode }) {
  const { locale, isRTL } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    const htmlElement = document.documentElement

    if (isRTL) {
      htmlElement.setAttribute('dir', 'rtl')
      htmlElement.setAttribute('lang', locale)
      htmlElement.classList.add('ar')
    } else {
      htmlElement.setAttribute('dir', 'ltr')
      htmlElement.setAttribute('lang', 'en')
      htmlElement.classList.remove('ar')
    }

    window.dispatchEvent(
      new CustomEvent('languagechange', {
        detail: { locale, isRTL },
      })
    )
  }, [isRTL, locale, mounted])

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <RTLandLanguageSync>
        {children}
      </RTLandLanguageSync>
    </NextThemesProvider>
  )
}