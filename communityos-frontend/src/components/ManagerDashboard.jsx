import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Trash2,
  Zap,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { getOrders } from "../services/api";

export default function ManagerDashboard({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await getOrders({ limit: 100 });
      setOrders(res.data.data || res.data.orders || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
  }, [token]);

  const active = orders.filter(
    (o) => !["COMPLETED", "CANCELLED"].includes(o.status)
  ).length;

  return (
    <section className="manager-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            COMMUNITY OPERATIONS CENTER
          </span>
          <h1>Estate Operations</h1>
          <p>Monitor services, residents and ongoing requests.</p>
        </div>

        <button className="secondary-button" onClick={load}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="manager-grid">
        <Metric icon={Building2} title="Buildings" value="8" />
        <Metric icon={Users} title="Residents" value="324" />
        <Metric icon={Wrench} title="Open Requests" value={active} />
        <Metric icon={CheckCircle2} title="Resolved" value={orders.length - active} />
      </div>

      <div className="community-pulse-card">
        <h2>Community Pulse</h2>

        <div className="pulse-services">
          <Pulse icon={Droplets} name="Water" status="Normal" green />
          <Pulse icon={Zap} name="Electricity" status="Stable" green />
          <Pulse icon={Trash2} name="Waste" status="On Schedule" green />
          <Pulse icon={ShieldCheck} name="Security" status="Operational" green />
          <Pulse icon={Wrench} name="Maintenance" status={`${active} Active`} />
        </div>
      </div>

      <div className="requests-panel">
        <h2>Latest Requests</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          orders.slice(0, 8).map((order) => (
            <div className="request-item" key={order.id}>
              <div>
                <strong>{order.service?.name || "Service Request"}</strong>
                <span>#{order.id}</span>
              </div>

              <span className={`status-badge status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function Metric({ icon: Icon, title, value }) {
  return (
    <div className="metric-card">
      <Icon size={22} />
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Pulse({ icon: Icon, name, status, green }) {
  return (
    <div className="pulse-row">
      <div>
        <Icon size={18} />
        <span>{name}</span>
      </div>

      <span className={green ? "pulse-good" : "pulse-warning"}>
        {status}
      </span>
    </div>
  );
}