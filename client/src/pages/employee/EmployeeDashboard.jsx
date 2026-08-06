import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/dashboard/stats')
        setStats(response.data.data)
      } catch (err) {
        alert('Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <LoadingSpinner />
  if (!stats) return null

  const chartData = [
    { name: 'Pending', value: stats.pendingRequests || 0 },
    { name: 'Approved', value: stats.approvedRequests || 0 },
    { name: 'Rejected', value: stats.rejectedRequests || 0 },
    { name: 'Total Visitors Today', value: stats.todaysVisitors || 0 }
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Employee Dashboard</h2>
        <Link to="/employee/requests">
          <button className="primary">View Visitor Requests</button>
        </Link>
      </div>
      
      <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s', marginTop: '2rem', padding: '2rem', height: '400px' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', textAlign: 'center' }}>My Visitor Statistics</h3>
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

export default EmployeeDashboard
