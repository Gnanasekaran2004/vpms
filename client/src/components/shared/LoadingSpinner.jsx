import React from 'react'

const LoadingSpinner = () => {
  let spinnerContainerStyleObj = { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: '2rem' 
  }
  
  let circleStyleObj = {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    animation: 'spin 1s linear infinite'
  }

  let textStyleObj = { 
    marginLeft: '1rem' 
  }

  return (
    <div style={spinnerContainerStyleObj}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={circleStyleObj} />
      <span style={textStyleObj}>Loading...</span>
    </div>
  )
}

export default LoadingSpinner
