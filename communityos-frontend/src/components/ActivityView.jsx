import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import * as orderService from '../services/orders.js';
import { getSocket, joinOrder } from '../services/socket.js';

const statusColors = {
  CREATED: 'status-pending',
  PROVIDER_ACCEPTED: 'status-info',
  WORKER_ASSIGNED: 'status-info',
  IN_PROGRESS: 'status-active',
  COMPLETED: 'status-success',
  CANCELLED: 'status-error',
};

const statusLabels = {
  CREATED: 'Order Created',
  PROVIDER_ACCEPTED: 'Accepted by Provider',
  WORKER_ASSIGNED: 'Worker Assigned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function ActivityView({ token }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await orderService.getOrders();
        setOrders(data.data || []);
        if (data.data?.length > 0) {
          setSelectedOrder(data.data[0]);
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadOrders();
    }
  }, [token]);

  useEffect(() => {
    async function loadTimeline() {
      if (!selectedOrder) return;

      try {
        const data = await orderService.getOrderTimeline(selectedOrder.id);
        setTimeline(data || []);
      } catch (error) {
        console.error('Failed to load timeline:', error);
      }
    }

    loadTimeline();

    // Join Socket.IO channel
    const socket = getSocket();
    if (socket && selectedOrder) {
      joinOrder(selectedOrder.id);

      // Listen for timeline updates
      socket.on('timeline:updated', (event) => {
        loadTimeline();
      });

      return () => {
        socket.off('timeline:updated');
      };
    }
  }, [selectedOrder]);

  if (loading) {
    return <div className="page-content-center"><Loader className="spinner" /></div>;
  }

  return (
    <div className="activity-view">
      <div className="activity-layout">
        <div className="orders-panel">
          <h2>Your Orders</h2>
          <div className="orders-list">
            {orders.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={40} />
                <p>No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <button
                  key={order.id}
                  className={`order-item ${selectedOrder?.id === order.id ? 'active' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-header">
                    <p className="order-id">#{order.id.slice(0, 8)}</p>
                    <span className={`status-badge ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="timeline-panel">
          {selectedOrder ? (
            <>
              <h2>Order Timeline</h2>
              <div className="timeline">
                {timeline.length === 0 ? (
                  <div className="empty-state">
                    <Clock size={40} />
                    <p>No events yet</p>
                  </div>
                ) : (
                  timeline.map((event, index) => (
                    <div key={event.id} className="timeline-event">
                      <div className="timeline-marker">
                        <div className="marker-dot"></div>
                        {index < timeline.length - 1 && <div className="marker-line"></div>}
                      </div>
                      <div className="timeline-content">
                        <p className="event-type">{event.type}</p>
                        <p className="event-time">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <AlertCircle size={40} />
              <p>Select an order to view timeline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
