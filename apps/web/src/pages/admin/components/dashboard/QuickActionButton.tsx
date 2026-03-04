import React from 'react'

type Variant = 'primary' | 'danger' | 'ghost'

interface QuickActionButtonProps {
  label: string
  icon?: React.ReactNode
  variant?: Variant
  onClick?: () => void
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[#00D084] text-white hover:bg-[#00B870]',
  danger: 'bg-red-50 text-red-500 hover:bg-red-100',
  ghost: 'bg-gray-50 text-slate-600 hover:bg-gray-100',
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
      className={[
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full',
        variantClasses[variant],
      ].join(' ')}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      {label}
    </button>
  )
}

export default QuickActionButton
