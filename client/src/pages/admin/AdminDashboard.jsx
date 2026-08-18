import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [chartHistory, setChartHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getStats = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          axiosInstance.get('/dashboard/stats'),
          axiosInstance.get('/dashboard/chart')
        ])
        setStats(statsRes.data.data)
        setChartHistory(chartRes.data.data)
      } catch (e) {
        console.error(e)
        setError(e.response?.data?.message || 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }
    getStats()
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
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s', padding: '2rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', textAlign: 'center' }}>Today's Overview</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
              <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Bar dataKey="value" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s', padding: '2rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#10b981', textAlign: 'center' }}>7-Day Visitor Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="_id" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
              <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Bar dataKey="totalVisitors" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
