import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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

  const barData = [
    { name: 'Employees', value: stats.totalEmployees || 0 },
    { name: "Today's Visitors", value: stats.todaysVisitors || 0 },
    { name: 'Total Visitors', value: stats.totalVisitors || 0 }
  ];

  const pieData = [
    { name: 'Pending', value: stats.pendingRequests || 0, color: '#f59e0b' },
    { name: 'Inside Now', value: stats.visitorsInsideNow || 0, color: '#10b981' },
    { name: 'Scheduled', value: stats.scheduledVisitors || 0, color: '#3b82f6' }
  ];

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h2>Admin Dashboard</h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        {/* 1. Bar Chart */}
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', textAlign: 'center', fontSize: '1.1rem' }}>General Overview</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                <YAxis stroke="var(--text-secondary)" allowDecimals={false} tick={{fontSize: 12}} />
                <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Donut Chart */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s', padding: '1.5rem', height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', color: '#3b82f6', textAlign: 'center', fontSize: '1.1rem' }}>Active Pass Status</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: -20, right: 0, left: 0, bottom: 0 }}>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
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

        {/* 3. Area Chart */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s', padding: '1.5rem', height: '350px', gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', color: '#10b981', textAlign: 'center', fontSize: '1.1rem' }}>7-Day Visitor Trend</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="_id" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                <YAxis stroke="var(--text-secondary)" allowDecimals={false} tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="totalVisitors" stroke="#10b981" fillOpacity={1} fill="url(#colorVis)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
