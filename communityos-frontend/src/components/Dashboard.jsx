import React, { useEffect, useState } from 'react';
import { Droplet, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import * as orderService from '../services/orders.js';
import * as communityService from '../services/communities.js';

export default function Dashboard({ token, user, role, onNavigate }) {
  const [community, setCommunity] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        
        // Load communities
        const communities = await communityService.getCommunities();
        if (communities.length > 0) {
          setCommunity(communities[0]);
        }

        // Load orders
        const orders = await orderService.getOrders(1, 5);
        setRecentOrders(orders.data || []);
        setStats({
          totalOrders: orders.pagination?.total || 0,
          pendingOrders: orders.data?.filter(o => o.status === 'CREATED').length || 0,
          completedOrders: orders.data?.filter(o => o.status === 'COMPLETED').length || 0,
        });
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadDashboard();
    }
  }, [token]);

  if (loading) {
    return <div className="page-content-center"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Good morning, {user?.fullName || 'there'}</h1>
          <p>{community?.name || 'Green Valley Estate'}</p>
        </div>
        <div className="community-badge">
          <Droplet size={20} />
          <span>Operational</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div>
            <p className="stat-label">Pending Orders</p>
            <p className="stat-value">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="stat-label">Completed</p>
            <p className="stat-value">{stats.completedOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <Droplet size={24} />
          </div>
          <div>
            <p className="stat-label">Total Orders</p>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>
      </div>

      {role === 'resident' && (
        <div className="section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="action-buttons">
            <button
              className="action-btn"
              onClick={() => onNavigate('services')}
            >
              <Droplet size={20} />
              <span>Request Service</span>
            </button>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2>Recent Orders</h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="orders-list">
            {recentOrders.map((order) => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <p className="order-id">Order #{order.id.slice(0, 8)}</p>
                  <p className="order-status">{order.status}</p>
                </div>
                <div className="order-meta">
                  <span className="order-total">KSh {order.total}</span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
