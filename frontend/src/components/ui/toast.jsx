import React from 'react'

export function Toast({ message, type, open }) {
  if (!open) return null

  const styles = {
    default: 'bg-gray-800 text-white',
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white'
  }

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md ${styles[type]}`}>
      {message}
    </div>
  )
}
