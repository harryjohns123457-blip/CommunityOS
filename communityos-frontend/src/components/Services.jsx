import { useEffect, useState } from "react";
import {
  ArrowRight,
  Droplets,
  Flame,
  Package,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";

import { getServices } from "../services/api";

const SERVICE_ICONS = {
  water: Droplets,
  gas: Flame,
  electricity: Zap,
  maintenance: Wrench,
  security: ShieldCheck,
};

function getIcon(service) {
  const value = String(
    service?.slug || service?.name || ""
  ).toLowerCase();

  const key = Object.keys(SERVICE_ICONS).find((item) =>
    value.includes(item)
  );

  return SERVICE_ICONS[key] || Package;
}

export default function Services({ token, onRequest }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadServices() {
      setLoading(true);
      setError("");

      try {
        const response = await getServices({
          active: true,
        });

        if (!mounted) return;

        const data =
          response?.data?.data ||
          response?.data?.services ||
          response?.data ||
          [];

        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.message ||
            "Unable to load available services."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (token) {
      loadServices();
    }

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <section className="services-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            SERVICE DIRECTORY
          </span>

          <h1>Services for your community</h1>

          <p>
            Find what you need and request it directly
            through CommunityOS.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onRequest}
        >
          Request a service
          <ArrowRight size={17} />
        </button>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="service-directory-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              className="service-directory-skeleton"
              key={item}
            />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="empty-card services-empty">
          <Package size={28} />

          <h2>No services available</h2>

          <p>
            There are currently no active services
            available for your community.
          </p>
        </div>
      ) : (
        <div className="service-directory-grid">
          {services.map((service) => {
            const Icon = getIcon(service);

            return (
              <article
                className="service-directory-card"
                key={service.id}
              >
                <div className="service-directory-icon">
                  <Icon size={22} />
                </div>

                <div className="service-directory-content">
                  <div className="service-title-row">
                    <h2>
                      {service.name ||
                        service.title ||
                        "Community service"}
                    </h2>

                    <span className="available-badge">
                      Available
                    </span>
                  </div>

                  <p>
                    {service.description ||
                      "A community service available through CommunityOS."}
                  </p>

                  <div className="service-card-footer">
                    <span>
                      {service.category ||
                        "Community service"}
                    </span>

                    <button
                      type="button"
                      className="service-action"
                      onClick={onRequest}
                    >
                      Request
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}