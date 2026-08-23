import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";

import { getOrders, updateOrder } from "../services/api";

const STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

function formatStatus(status) {
  return String(status || "PENDING")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date) {
  if (!date) return "Recently";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Recently";
  }

  return value.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProviderDashboard({ token, user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const response = await getOrders({
        limit: 100,
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
          "Unable to load provider orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          String(order.status || "").toUpperCase() ===
          STATUS.PENDING
      ),
    [orders]
  );

  const activeOrders = useMemo(
    () =>
      orders.filter((order) =>
        [
          STATUS.CONFIRMED,
          STATUS.IN_PROGRESS,
        ].includes(
          String(order.status || "").toUpperCase()
        )
      ),
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          String(order.status || "").toUpperCase() ===
          STATUS.COMPLETED
      ),
    [orders]
  );

  async function changeStatus(orderId, status) {
    setUpdatingId(orderId);
    setError("");

    try {
      await updateOrder(orderId, {
        status,
      });

      await loadOrders();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update this request."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="provider-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            PROVIDER OPERATIONS
          </span>

          <h1>Service operations</h1>

          <p>
            Manage incoming requests and keep customers
            informed as work progresses.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={loadOrders}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="provider-welcome">
        <div className="provider-welcome-icon">
          <Truck size={23} />
        </div>

        <div>
          <span className="section-kicker">
            PROVIDER WORKSPACE
          </span>

          <h2>
            Welcome back
            {user?.fullName
              ? `, ${user.fullName.split(" ")[0]}`
              : ""}
            .
          </h2>

          <p>
            Here is the current workload for your service
            operation.
          </p>
        </div>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="provider-metrics">
        <article className="provider-metric">
          <div className="metric-icon">
            <Clock3 size={19} />
          </div>

          <span>New requests</span>

          <strong>
            {loading ? "—" : pendingOrders.length}
          </strong>
        </article>

        <article className="provider-metric">
          <div className="metric-icon">
            <Truck size={19} />
          </div>

          <span>Active jobs</span>

          <strong>
            {loading ? "—" : activeOrders.length}
          </strong>
        </article>

        <article className="provider-metric">
          <div className="metric-icon">
            <CheckCircle2 size={19} />
          </div>

          <span>Completed</span>

          <strong>
            {loading ? "—" : completedOrders.length}
          </strong>
        </article>
      </div>

      <section className="provider-orders-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">
              WORK QUEUE
            </span>

            <h2>Service requests</h2>
          </div>
        </div>

        {loading ? (
          <div className="provider-order-list">
            {[1, 2, 3].map((item) => (
              <div
                className="activity-skeleton"
                key={item}
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-card">
            <Package size={28} />

            <h2>No service requests</h2>

            <p>
              New customer requests will appear here.
            </p>
          </div>
        ) : (
          <div className="provider-order-list">
            {orders.map((order) => {
              const status = String(
                order.status || STATUS.PENDING
              ).toUpperCase();

              const updating = updatingId === order.id;

              return (
                <article
                  className="provider-order-card"
                  key={order.id}
                >
                  <div className="provider-order-icon">
                    <Package size={20} />
                  </div>

                  <div className="provider-order-content">
                    <div className="provider-order-heading">
                      <div>
                        <span className="activity-date">
                          #{order.id} ·{" "}
                          {formatDate(
                            order.createdAt ||
                              order.created_at
                          )}
                        </span>

                        <h3>
                          {order.service?.name ||
                            order.serviceName ||
                            "Service request"}
                        </h3>
                      </div>

                      <span
                        className={`status-badge status-${status.toLowerCase()}`}
                      >
                        {formatStatus(status)}
                      </span>
                    </div>

                    <div className="provider-order-details">
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
                            <MapPin size={14} />
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

                    <div className="provider-order-actions">
                      {status === STATUS.PENDING && (
                        <button
                          type="button"
                          className="primary-button small"
                          disabled={updating}
                          onClick={() =>
                            changeStatus(
                              order.id,
                              STATUS.CONFIRMED
                            )
                          }
                        >
                          {updating
                            ? "Updating..."
                            : "Accept request"}
                          {!updating && (
                            <ArrowRight size={15} />
                          )}
                        </button>
                      )}

                      {status === STATUS.CONFIRMED && (
                        <button
                          type="button"
                          className="primary-button small"
                          disabled={updating}
                          onClick={() =>
                            changeStatus(
                              order.id,
                              STATUS.IN_PROGRESS
                            )
                          }
                        >
                          Start job
                          <ArrowRight size={15} />
                        </button>
                      )}

                      {status === STATUS.IN_PROGRESS && (
                        <button
                          type="button"
                          className="primary-button small"
                          disabled={updating}
                          onClick={() =>
                            changeStatus(
                              order.id,
                              STATUS.COMPLETED
                            )
                          }
                        >
                          Mark completed
                          <CheckCircle2 size={15} />
                        </button>
                      )}

                      {[
                        STATUS.COMPLETED,
                        STATUS.CANCELLED,
                      ].includes(status) && (
                        <span className="completed-label">
                          <CheckCircle2 size={15} />
                          Request closed
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}