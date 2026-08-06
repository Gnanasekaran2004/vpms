import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/dashboard/stats')
        setStats(response.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!stats) return null

  const chartData = [
    { name: 'Pending', value: stats.pendingRequests || 0 },
    { name: "Today's Visitors", value: stats.todaysVisitors || 0 },
    { name: 'Inside Now', value: stats.visitorsInsideNow || 0 },
    { name: 'Employees', value: stats.totalEmployees || 0 },
    { name: 'Scheduled', value: stats.scheduledVisitors || 0 },
    { name: 'Total Visitors', value: stats.totalVisitors || 0 }
  ];

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h2>Admin Dashboard</h2>
      </div>
      
      <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s', marginTop: '2rem', padding: '2rem', height: '400px' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', textAlign: 'center' }}>Key Statistics</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
            <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }} />
            <Bar dataKey="value" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AdminDashboard
