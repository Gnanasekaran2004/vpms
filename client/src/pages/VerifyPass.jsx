import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

const statusColors = {
  Pending:    { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  Approved:   { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
  CheckedIn:  { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
  CheckedOut: { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1' },
  Rejected:   { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  Cancelled:  { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' },
}

const VerifyPass = () => {
  const { passNumber } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance.get(`/verify/${passNumber}`)
      .then(res => setData(res.data.data))
      .catch(() => setError('Visitor pass not found or invalid QR code.'))
      .finally(() => setLoading(false))
  }, [passNumber])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.2rem', color: '#6b7280' }}>
      Verifying pass...
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '12px', padding: '2rem', maxWidth: '400px' }}>
        <div style={{ fontSize: '3rem' }}>❌</div>
        <h2 style={{ color: '#991b1b' }}>Invalid Pass</h2>
        <p style={{ color: '#7f1d1d' }}>{error}</p>
      </div>
    </div>
  )

  const colors = statusColors[data.status] || statusColors.Pending

  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <span style={{ color: '#111827', fontWeight: 600 }}>{value}</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', maxWidth: '480px', width: '100%', overflow: 'hidden' }}>

        <div style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', padding: '1.5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>VPMS</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>Visitor Pass Management System</div>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.25rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pass Number</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{data.passNumber}</div>
          </div>
          <div style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '999px', padding: '0.4rem 1rem', fontWeight: 700, fontSize: '0.85rem' }}>
            {data.status === 'CheckedIn' ? '✅ CHECKED IN' : data.status === 'CheckedOut' ? '🏁 CHECKED OUT' : data.status.toUpperCase()}
          </div>
        </div>

        <div style={{ padding: '1.25rem 2rem' }}>
          <Row label="Visitor" value={data.visitorName} />
          <Row label="Person to Meet" value={data.personToMeet} />
          <Row label="Department" value={data.department} />
          <Row label="Visit Date" value={new Date(data.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
          {data.checkInTime && <Row label="Check-In Time" value={new Date(data.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />}
          {data.checkOutTime && <Row label="Check-Out Time" value={new Date(data.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />}
        </div>

        <div style={{ background: '#f1f5f9', padding: '1rem 2rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
          🔒 This is a secure QR verification. Details are read-only.
        </div>
      </div>
    </div>
  )
}

export default VerifyPass