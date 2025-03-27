import { useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'default' // 'default' | 'success' | 'error'
  })

  const showToast = (message, type = 'default') => {
    setToast({ open: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, open: false }))
    }, 3000)
  }

  return { toast, showToast }
}
