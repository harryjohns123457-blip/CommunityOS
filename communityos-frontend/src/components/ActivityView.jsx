import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { getOrders } from "../services/api";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock3,
    className: "pending",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "confirmed",
  },
  IN_PROGRESS: {
    label: "In progress",
    icon: RefreshCw,
    className: "in-progress",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "completed",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "cancelled",
  },
  CANCELED: {
    label: "Cancelled",
    icon: XCircle,
    className: "cancelled",
  },
};

function getStatus(status) {
  const key = String(status || "PENDING").toUpperCase();

  return (
    STATUS_CONFIG[key] || {
      label: key.replaceAll("_", " "),
      icon: AlertCircle,
      className: "pending",
    }
  );
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivityView({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadActivity() {
    setLoading(true);
    setError("");

    try {
      const response = await getOrders({
        limit: 50,
      });

      const data =
        response?.data?.data ||
        response?.data?.orders ||
        response?.data ||
        [];

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load your activity."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadActivity();
    }
  }, [token]);

  return (
    <section className="activity-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            SYNC TIMELINE
          </span>

          <h1>Your activity</h1>

          <p>
            Follow your service requests from submission
            through completion.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={loadActivity}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="activity-list">
          {[1, 2, 3, 4].map((item) => (
            <div
              className="activity-skeleton"
              key={item}
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-card activity-empty">
          <div className="empty-icon">
            <Package size={26} />
          </div>

          <h2>No activity yet</h2>

          <p>
            Once you submit a service request, its progress
            will appear here.
          </p>
        </div>
      ) : (
        <div className="activity-layout">
          <div className="activity-list">
            {orders.map((order) => {
              const status = getStatus(order.status);
              const StatusIcon = status.icon;

              const createdAt =
                order.createdAt ||
                order.created_at;

              const serviceName =
                order.service?.name ||
                order.serviceName ||
                order.service?.title ||
                "Service request";

              return (
                <article
                  className="activity-card"
                  key={order.id}
                >
                  <div
                    className={`activity-status-icon ${status.className}`}
                  >
                    <StatusIcon size={19} />
                  </div>

                  <div className="activity-main">
                    <div className="activity-card-heading">
                      <div>
                        <span className="activity-date">
                          {formatDate(createdAt)}
                          {formatTime(createdAt) &&
                            ` · ${formatTime(createdAt)}`}
                        </span>

                        <h2>{serviceName}</h2>
                      </div>

                      <span
                        className={`status-badge status-${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="activity-details">
                      <div>
                        <span>Reference</span>

                        <strong>
                          #{order.id || "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Quantity</span>

                        <strong>
                          {order.quantity || 1}
                        </strong>
                      </div>

                      {order.location && (
                        <div>
                          <span>Location</span>

                          <strong>
                            {order.location}
                          </strong>
                        </div>
                      )}
                    </div>

                    {order.notes && (
                      <p className="activity-notes">
                        {order.notes}
                      </p>
                    )}

                    <button
                      type="button"
                      className="activity-link"
                    >
                      View request
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="activity-summary">
            <span className="section-kicker">
              REQUEST SUMMARY
            </span>

            <h2>Service activity</h2>

            <div className="activity-stat">
              <span>Total requests</span>
              <strong>{orders.length}</strong>
            </div>

            <div className="activity-stat">
              <span>Active</span>
              <strong>
                {
                  orders.filter(
                    (order) =>
                      ![
                        "COMPLETED",
                        "CANCELLED",
                        "CANCELED",
                      ].includes(
                        String(
                          order.status || ""
                        ).toUpperCase()
                      )
                  ).length
                }
              </strong>
            </div>

            <div className="activity-stat">
              <span>Completed</span>
              <strong>
                {
                  orders.filter(
                    (order) =>
                      String(
                        order.status || ""
                      ).toUpperCase() === "COMPLETED"
                  ).length
                }
              </strong>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}