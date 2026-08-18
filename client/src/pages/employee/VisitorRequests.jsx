import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import StatusBadge from '../../components/shared/StatusBadge'

const VisitorRequests = () => {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('Pending')
  const [actionId, setActionId] = useState(null)
  const [remarks, setRemarks] = useState('')

  const [selectedIds, setSelectedIds] = useState([])

  const getVisitorsData = async (shouldShowLoader = true) => {
    if (shouldShowLoader) {
      setLoading(true)
    }
    try {
      let endpoint = '/visitors'
      if (statusFilter) {
        endpoint = `/visitors?status=${statusFilter}`
      }
      const visitorsRes = await axiosInstance.get(endpoint)
      setVisitors(visitorsRes.data.data || [])
      setSelectedIds([]) // reset selections
    } catch (e) {
      console.log('error getting visitors', e)
      alert('Error fetching visitor requests')
    } finally {
      if (shouldShowLoader) {
        setLoading(false)
      }
    }
  }

  // refresh when filter changes
  useEffect(() => {
    getVisitorsData(true)
  }, [statusFilter])

  const doAction = async (id, actionType) => {
    if (actionType === 'reject' && remarks.trim() === '') {
      alert('Remarks are required for rejection')
      return
    }

    try {
      await axiosInstance.patch(`/visitors/${id}/${actionType}`, { remarks: remarks })
      setActionId(null)
      setRemarks('')
      getVisitorsData(false)
    } catch (e) {
      console.log(e)
      alert(e.response?.data?.message || `Error performing ${actionType}`)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return
    try {
      setLoading(true)
      const res = await axiosInstance.patch('/visitors/bulk-approve', { visitorIds: selectedIds })
      alert(res.data.message || 'Bulk approve successful')
      getVisitorsData(true)
    } catch (e) {
      alert('Error during bulk approve')
      setLoading(false)
    }
  }

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selId => selId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Visitor Requests</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
             <button onClick={handleBulkApprove} className="success">
               Bulk Approve ({selectedIds.length})
             </button>
          )}
          <label style={{ margin: 0 }}>Filter by Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="CheckedIn">Checked In</option>
            <option value="CheckedOut">Checked Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="table-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(visitors.filter(v => v.status === 'Pending').map(v => v._id))
                  } else {
                    setSelectedIds([])
                  }
                }} /></th>
                <th>Visitor Name</th>
                <th>Phone</th>
                <th>Visit Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(v => (
                <tr key={v._id}>
                  <td>
                    {v.status === 'Pending' && (
                      <input type="checkbox" checked={selectedIds.includes(v._id)} onChange={() => toggleSelection(v._id)} />
                    )}
                  </td>
                  <td><strong>{v.visitorName}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.visitorPhone}</td>
                  <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                  <td>{new Date(v.expectedArrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                  <td>{v.purposeOfVisit}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.remarks || '-'}</td>
                  <td>
                    {v.status === 'Pending' && actionId !== v._id && (
                      <button onClick={() => setActionId(v._id)} className="primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Respond</button>
                    )}
                    {actionId === v._id && (
                      <div className="glass-card" style={{ padding: '1rem', marginTop: '0.5rem', minWidth: '250px', position: 'absolute', zIndex: 10, right: '2rem' }}>
                        <input type="text" placeholder="Add remarks (required for reject)..." value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{ display: 'block', marginBottom: '1rem', width: '100%' }} />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => { setActionId(null); setRemarks(''); }} className="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>
                          <button onClick={() => doAction(v._id, 'reject')} className="danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Reject</button>
                          <button onClick={() => doAction(v._id, 'approve')} className="success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Approve</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {visitors.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No visitor requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default VisitorRequests
