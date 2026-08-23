
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  Flame,
  Gauge,
  Home,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react";

import {
  getCommunities,
  getIncidents,
  getNotifications,
  getOrders,
  getServices,
} from "../services/api";

const SERVICE_ICONS = {
  water: Droplets,
  gas: Flame,
  electricity: Zap,
  waste: Trash2,
  maintenance: Wrench,
  security: ShieldCheck,
  deliveries: Package,
};

function getServiceIcon(name = "") {
  const key = name.toLowerCase();

  const match = Object.keys(SERVICE_ICONS).find((item) =>
    key.includes(item)
  );

  return SERVICE_ICONS[match] || Gauge;
}

function formatTime(date) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatus(order) {
  const status = String(order?.status || "").toUpperCase();

  if (
    ["COMPLETED", "DELIVERED", "RESOLVED", "SUCCESS"].includes(
      status
    )
  ) {
    return {
      label: "Completed",
      className: "status-normal",
    };
  }

  if (
    ["FAILED", "CANCELLED", "REJECTED"].includes(status)
  ) {
    return {
      label: "Needs attention",
      className: "status-danger",
    };
  }

  return {
    label: "In progress",
    className: "status-warning",
  };
}

export default function Dashboard({
  user,
  onNavigate,
}) {
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const communityName =
    user?.community?.name ||
    user?.communityName ||
    "Your Community";

  const unitName =
    user?.unit?.name ||
    user?.unitNumber ||
    user?.unit ||
    "Your unit";

  async function loadDashboard(isRefresh = false) {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const results = await Promise.allSettled([
        getServices(),
        getOrders(),
        getIncidents(),
        getNotifications(),
        getCommunities(),
      ]);

      const [
        servicesResult,
        ordersResult,
        incidentsResult,
        notificationsResult,
      ] = results;

      if (servicesResult.status === "fulfilled") {
        setServices(
          servicesResult.value?.data?.data ||
            servicesResult.value?.data ||
            []
        );
      }

      if (ordersResult.status === "fulfilled") {
        setOrders(
          ordersResult.value?.data?.data ||
            ordersResult.value?.data ||
            []
        );
      }

      if (incidentsResult.status === "fulfilled") {
        setIncidents(
          incidentsResult.value?.data?.data ||
            incidentsResult.value?.data ||
            []
        );
      }

      if (notificationsResult.status === "fulfilled") {
        setNotifications(
          notificationsResult.value?.data?.data ||
            notificationsResult.value?.data ||
            []
        );
      }

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length === results.length) {
        throw new Error(
          "CommunityOS could not load your community data."
        );
      }
    } catch (err) {
      console.error("Dashboard loading failed:", err);

      setError(
        err?.message ||
          "Unable to load the community dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const activeOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = String(
        order?.status || ""
      ).toUpperCase();

      return ![
        "COMPLETED",
        "DELIVERED",
        "CANCELLED",
        "FAILED",
        "RESOLVED",
      ].includes(status);
    });
  }, [orders]);

  const openIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const status = String(
        incident?.status || ""
      ).toUpperCase();

      return ![
        "RESOLVED",
        "CLOSED",
        "COMPLETED",
      ].includes(status);
    });
  }, [incidents]);

  const pulse = [
    {
      name: "Water",
      icon: Droplets,
      status: "Normal",
      type: "normal",
    },
    {
      name: "Gas",
      icon: Flame,
      status: "Available",
      type: "normal",
    },
    {
      name: "Electricity",
      icon: Zap,
      status: "Normal",
      type: "normal",
    },
    {
      name: "Waste",
      icon: Trash2,
      status: "On schedule",
      type: "normal",
    },
    {
      name: "Maintenance",
      icon: Wrench,
      status:
        openIncidents.length > 0
          ? `${openIncidents.length} open`
          : "Clear",
      type:
        openIncidents.length > 0
          ? "warning"
          : "normal",
    },
    {
      name: "Security",
      icon: ShieldCheck,
      status: "Normal",
      type: "normal",
    },
  ];

  const recentOrders = orders.slice(0, 4);

  return (
    <div className="dashboard-grid">
      <section className="page-heading">
        <div>
          <span className="section-kicker">
            RESIDENT WORKSPACE
          </span>

          <h1>
            Good morning
            {user?.firstName
              ? `, ${user.firstName}`
              : ""}
            .
          </h1>

          <p>
            Stay connected to the services, people and
            activity keeping your community running.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={refreshing ? "spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </section>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <section className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div className="service-icon">
              <Home size={20} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                {communityName}
              </div>

              <div
                style={{
                  marginTop: 4,
                  color: "var(--muted)",
                  fontSize: 11,
                }}
              >
                {unitName}
              </div>
            </div>
          </div>

          <div className="status-badge status-normal">
            <span className="status-dot" />
            Community operating normally
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <span className="section-kicker">
              LIVE OVERVIEW
            </span>

            <h2 style={{ marginTop: 5 }}>
              Community Pulse
            </h2>
          </div>

          <span
            style={{
              color: "var(--muted)",
              fontSize: 10,
            }}
          >
            Updated just now
          </span>
        </div>

        <div className="card community-pulse">
          {loading ? (
            <div className="pulse-grid">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="service-directory-skeleton"
                    style={{ minHeight: 65 }}
                  />
                )
              )}
            </div>
          ) : (
            <div className="pulse-grid">
              {pulse.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className="pulse-item"
                    key={item.name}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                      }}
                    >
                      <Icon
                        size={16}
                        style={{
                          color: "var(--brand)",
                        }}
                      />

                      <span className="pulse-name">
                        {item.name}
                      </span>
                    </div>

                    <span
                      className={`status-badge status-${item.type}`}
                    >
                      <span className="status-dot" />
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-label">
            Active requests
          </div>

          <div className="stat-value">
            {activeOrders.length}
          </div>

          <div className="stat-change">
            Services in progress
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            Open incidents
          </div>

          <div className="stat-value">
            {openIncidents.length}
          </div>

          <div
            className={
              openIncidents.length
                ? "stat-change"
                : ""
            }
            style={{
              color: openIncidents.length
                ? "var(--warning)"
                : "var(--success)",
            }}
          >
            {openIncidents.length
              ? "Being monitored"
              : "No active issues"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            Available services
          </div>

          <div className="stat-value">
            {services.length}
          </div>

          <div className="stat-change">
            In your community
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            Notifications
          </div>

          <div className="stat-value">
            {notifications.length}
          </div>

          <div className="stat-change">
            Community updates
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <span className="section-kicker">
              ESSENTIAL SERVICES
            </span>

            <h2 style={{ marginTop: 5 }}>
              What do you need?
            </h2>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => onNavigate?.("services")}
          >
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="service-directory-grid">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="service-directory-skeleton"
                />
              )
            )}
          </div>
        ) : services.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">
              <Gauge size={21} />
            </div>

            <h2>No services available yet</h2>

            <p>
              Your community has not published any
              services yet.
            </p>
          </div>
        ) : (
          <div className="service-directory-grid">
            {services.slice(0, 6).map((service) => {
              const Icon = getServiceIcon(
                service?.name
              );

              return (
                <button
                  type="button"
                  key={service.id}
                  className="service-directory-card"
                  onClick={() =>
                    onNavigate?.("order")
                  }
                >
                  <div className="service-icon">
                    <Icon size={20} />
                  </div>

                  <h3>
                    {service.name ||
                      "Community service"}
                  </h3>

                  <p>
                    {service.description ||
                      "Available service for your community."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 18,
                      color: "var(--brand)",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    Request service
                    <ChevronRight size={13} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.35fr) minmax(300px, .65fr)",
          gap: 20,
        }}
      >
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <span className="section-kicker">
                SERVICE ACTIVITY
              </span>

              <h2 style={{ marginTop: 5 }}>
                Your recent requests
              </h2>
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">
                <Package size={20} />
              </div>

              <h2>No requests yet</h2>

              <p>
                When you request a community service,
                its progress will appear here.
              </p>
            </div>
          ) : (
            <div className="activity-list">
              {recentOrders.map((order) => {
                const status = getStatus(order);

                return (
                  <div
                    className="activity-card"
                    key={order.id}
                  >
                    <div className="activity-status-icon">
                      <Package size={17} />
                    </div>

                    <div>
                      <h3>
                        {order.service?.name ||
                          order.serviceName ||
                          "Service request"}
                      </h3>

                      <p>
                        {order.description ||
                          `Request ${order.id || ""}`}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          marginTop: 9,
                          color: "var(--subtle)",
                          fontSize: 9,
                        }}
                      >
                        <span>
                          <Clock3
                            size={11}
                            style={{
                              verticalAlign: "middle",
                              marginRight: 4,
                            }}
                          />
                          {formatTime(
                            order.createdAt
                          )}
                        </span>

                        {order.deliveryAddress && (
                          <span>
                            <MapPin
                              size={11}
                              style={{
                                verticalAlign:
                                  "middle",
                                marginRight: 4,
                              }}
                            />
                            {order.deliveryAddress}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`status-badge ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <span className="section-kicker">
                COMMUNITY UPDATES
              </span>

              <h2 style={{ marginTop: 5 }}>
                Notifications
              </h2>
            </div>

            <Bell
              size={17}
              style={{ color: "var(--muted)" }}
            />
          </div>

          <div className="card">
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "30px 10px",
                  textAlign: "center",
                  color: "var(--muted)",
                  fontSize: 11,
                  lineHeight: 1.6,
                }}
              >
                <Bell
                  size={22}
                  style={{
                    color: "var(--brand)",
                    marginBottom: 10,
                  }}
                />

                <div>
                  You're all caught up.
                </div>
              </div>
            ) : (
              <div style={{ display: "grid" }}>
                {notifications
                  .slice(0, 5)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: "13px 0",
                        borderBottom:
                          "1px solid var(--border)",
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          flex: "0 0 auto",
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 8,
                          background:
                            "var(--brand-light)",
                          color: "var(--brand)",
                        }}
                      >
                        <Bell size={14} />
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {notification.title ||
                            "Community update"}
                        </div>

                        <div
                          style={{
                            marginTop: 4,
                            color: "var(--muted)",
                            fontSize: 10,
                            lineHeight: 1.5,
                          }}
                        >
                          {notification.message ||
                            notification.body ||
                            "You have a new community notification."}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background:
            "linear-gradient(135deg, #ffffff 0%, #f1f8f5 100%)",
        }}
      >
        <div className="service-icon">
          <Sparkles size={20} />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            CommunityOS keeps everyone synchronized.
          </div>

          <div
            style={{
              marginTop: 4,
              color: "var(--muted)",
              fontSize: 10,
              lineHeight: 1.5,
            }}
          >
            Service requests, provider updates and
            community activity are coordinated in one
            operational timeline.
          </div>
        </div>

        <CheckCircle2
          size={20}
          style={{ color: "var(--success)" }}
        />
      </section>
    </div>
  );
}
