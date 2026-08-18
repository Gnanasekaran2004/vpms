import React, { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import VisitorPassPDF from './VisitorPassPDF'

const DownloadPassButton = ({ visitor }) => {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (!visitor.passNumber) {
      alert('This visitor does not have a pass number yet. Only newly registered visitors have pass numbers.')
      return
    }

    setLoading(true)
    try {
      
      const verifyUrl = `${window.location.origin}/verify/${visitor.passNumber}`
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
        color: { dark: '#1e293b', light: '#ffffff' }
      })

      const blob = await pdf(
        <VisitorPassPDF visitor={visitor} qrDataUrl={qrDataUrl} />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${visitor.passNumber}-VisitorPass.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('PDF generation failed:', e)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading || !visitor.passNumber}
      className="secondary"
      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', opacity: visitor.passNumber ? 1 : 0.4 }}
      title={visitor.passNumber ? `Download pass ${visitor.passNumber}` : 'No pass number — register a new visitor'}
    >
      {loading ? '⏳' : '📄 Pass'}
    </button>
  )
}

export default DownloadPassButton