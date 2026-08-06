import React from 'react'

const StatusBadge = ({ status }) => {
  const getStyle = () => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '4px',
      color: 'white',
      display: 'inline-block',
      fontSize: '0.85rem'
    }

    switch (status) {
      case 'Pending':
        return { ...baseStyle, backgroundColor: '#f59e0b' }
      case 'Approved':
        return { ...baseStyle, backgroundColor: '#3b82f6' }
      case 'CheckedIn':
        return { ...baseStyle, backgroundColor: '#10b981' }
      case 'CheckedOut':
        return { ...baseStyle, backgroundColor: '#6b7280' }
      case 'Rejected':
        return { ...baseStyle, backgroundColor: '#ef4444' }
      case 'Cancelled':
        return { ...baseStyle, backgroundColor: '#374151' }
      default:
        return { ...baseStyle, backgroundColor: '#000000' }
    }
  }

  return <span style={getStyle()}>{status}</span>
}

export default StatusBadge
