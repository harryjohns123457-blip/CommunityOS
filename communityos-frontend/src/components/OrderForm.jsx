import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import * as orderService from '../services/orders.js';
import * as serviceService from '../services/services.js';
import * as communityService from '../services/communities.js';

export default function OrderForm({ token, onCreated }) {
  const [services, setServices] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [servicesData, communitiesData] = await Promise.all([
          serviceService.getServices(),
          communityService.getCommunities(),
        ]);
        setServices(servicesData || []);
        setCommunities(communitiesData || []);
        if (servicesData?.length > 0) {
          setSelectedService(servicesData[0].id);
        }
        if (communitiesData?.length > 0) {
          setSelectedCommunity(communitiesData[0].id);
        }
      } catch (error) {
        setError('Failed to load form data');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadData();
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const order = await orderService.createOrder({
        communityId: selectedCommunity,
        items: [
          {
            serviceId: selectedService,
            quantity: parseInt(quantity),
          },
        ],
        notes,
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="page-content-center"><Loader className="spinner" /></div>;
  }

  return (
    <div className="order-form">
      <div className="page-header">
        <h1>Request Service</h1>
        <p>Order essential services for your unit</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Community</label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            required
          >
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Service</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            required
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - KSh {s.unitPrice}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special instructions..."
            rows="4"
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting ? 'Creating order...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
}
