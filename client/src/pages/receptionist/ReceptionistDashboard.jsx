import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // load data for dash
    const loadDashboardStats = async () => {
      try {
        const statsData = await axiosInstance.get('/dashboard/stats')
        setStats(statsData.data.data)
      } catch (err) {
        console.error(err)
        alert('Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }
    loadDashboardStats()
  }, [])

  if (loading) return <LoadingSpinner />
  if (!stats) return null

  const chartData = [
    { name: 'Pending', value: stats.pendingRequests || 0 },
    { name: "Today's Visitors", value: stats.todaysVisitors || 0 },
    { name: 'Inside Now', value: stats.visitorsInsideNow || 0 },
    { name: 'Approved Today', value: stats.approvedToday || 0 }
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Receptionist Dashboard</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/receptionist/register">
            <button className="primary">+ Register Visitor</button>
          </Link>
          <Link to="/receptionist/history">
            <button className="secondary">View History</button>
          </Link>
        </div>
      </div>

      <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s', marginTop: '2rem', padding: '2rem', height: '400px' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', textAlign: 'center' }}>Visitor Activity Overview</h3>
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

export default ReceptionistDashboard
