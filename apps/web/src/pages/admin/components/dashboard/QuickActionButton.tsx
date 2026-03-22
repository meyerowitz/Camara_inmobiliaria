import React from 'react'

type Variant = 'primary' | 'danger' | 'ghost'

interface QuickActionButtonProps {
  label: string
  icon?: React.ReactNode
  variant?: Variant
  onClick?: () => void
}

const getVariantStyle = (variant: Variant): React.CSSProperties => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: 'var(--color-admin-accent)',
        color: 'var(--color-text-on-accent)',
      }
    case 'danger':
      return {
        backgroundColor: 'var(--color-bg-subtle)',
        color: 'var(--color-danger)',
      }
    default:
      return {
        backgroundColor: 'var(--color-bg-subtle)',
        color: 'var(--color-text-base)',
      }
  }
}

const QuickActionButton = ({
  label,
  icon,
  variant = 'ghost',
  onClick,
}: QuickActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={getVariantStyle(variant)}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full"
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      {label}
    </button>
  )
}

export default QuickActionButton
