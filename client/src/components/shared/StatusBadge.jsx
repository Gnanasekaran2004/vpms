import React from 'react'

const StatusBadge = (propsObj) => {
  let currentStatusString = propsObj.status

  let calculateMyStyleFunc = () => {
    let myBaseStyleObj = {
      padding: '4px 8px',
      borderRadius: '4px',
      color: 'white',
      display: 'inline-block',
      fontSize: '0.85rem'
    }

    if (currentStatusString === 'Pending') {
      return { ...myBaseStyleObj, backgroundColor: '#f59e0b' }
    } else if (currentStatusString === 'Approved') {
      return { ...myBaseStyleObj, backgroundColor: '#3b82f6' }
    } else if (currentStatusString === 'CheckedIn') {
      return { ...myBaseStyleObj, backgroundColor: '#10b981' }
    } else if (currentStatusString === 'CheckedOut') {
      return { ...myBaseStyleObj, backgroundColor: '#6b7280' }
    } else if (currentStatusString === 'Rejected') {
      return { ...myBaseStyleObj, backgroundColor: '#ef4444' }
    } else if (currentStatusString === 'Cancelled') {
      return { ...myBaseStyleObj, backgroundColor: '#374151' }
    } else {
      return { ...myBaseStyleObj, backgroundColor: '#000000' }
    }
  }

  let finalStyleToUse = calculateMyStyleFunc()
  return <span style={finalStyleToUse}>{currentStatusString}</span>
}

export default StatusBadge
