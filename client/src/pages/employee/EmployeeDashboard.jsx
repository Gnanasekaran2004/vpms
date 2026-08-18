import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMyStats = async () => {
      try {
        const myStatsRes = await axiosInstance.get('/dashboard/stats')
        setStats(myStatsRes.data.data)
      } catch (e) {
        console.log(e)
        alert('Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }
    loadMyStats()
  }, [])

  if (loading) return <LoadingSpinner />
  if (!stats) return null

  const pieData = [
    { name: 'Pending', value: stats.pendingRequests || 0, color: '#f59e0b' },
    { name: 'Approved', value: stats.approvedRequests || 0, color: '#10b981' },
    { name: 'Rejected', value: stats.rejectedRequests || 0, color: '#ef4444' }
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Employee Dashboard</h2>
        <Link to="/employee/requests">
          <button className="primary">View Visitor Requests</button>
        </Link>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s', padding: '1.5rem', height: '350px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', textAlign: 'center', fontSize: '1.1rem' }}>My Visitor Statistics</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: -20, right: 0, left: 0, bottom: 0 }}>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard
