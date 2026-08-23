import React, { useEffect, useState } from 'react';
import { Droplet, AlertCircle, Loader } from 'lucide-react';
import * as serviceService from '../services/services.js';
import * as providerService from '../services/providers.js';

export default function Services({ token, onRequest }) {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const [servicesData, providersData] = await Promise.all([
          serviceService.getServices(),
          providerService.getProviders(),
        ]);
        setServices(servicesData || []);
        setProviders(providersData || []);
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadServices();
    }
  }, [token]);

  if (loading) {
    return <div className="page-content-center"><Loader className="spinner" /></div>;
  }

  return (
    <div className="services-page">
      <div className="page-header">
        <h1>Available Services</h1>
        <p>Browse and request services from verified providers</p>
      </div>

      {services.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={40} />
          <p>No services available</p>
        </div>
      ) : (
        <div className="services-grid">
          {services.map((service) => {
            const provider = providers.find((p) => p.id === service.providerId);
            return (
              <div key={service.id} className="service-card">
                <div className="service-icon">
                  <Droplet size={32} />
                </div>
                <h3>{service.name}</h3>
                <p className="service-description">{service.description}</p>
                <p className="service-provider">{provider?.companyName}</p>
                <div className="service-footer">
                  <span className="service-price">KSh {service.unitPrice}</span>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setSelectedService(service);
                      onRequest();
                    }}
                  >
                    Request
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
