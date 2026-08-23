import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Package,
} from "lucide-react";

import ServicesSelect from "./ServicesSelect";
import { createOrder } from "../services/api";

export default function OrderForm({
  token,
  onCreated,
  onBack,
}) {
  const [service, setService] = useState(null);

  const [form, setForm] = useState({
    quantity: 1,
    notes: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!service) {
      setError("Please select a service.");
      return;
    }

    if (!form.location.trim()) {
      setError("Please provide the service location.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createOrder({
        serviceId: service.id,
        quantity,
        notes: form.notes.trim() || undefined,
        location: form.location.trim(),
      });

      const order =
        response?.data?.data ||
        response?.data?.order ||
        response?.data;

      setSuccess(order || {});

    } catch (err) {
      setError(
        err?.message ||
          "Unable to create your service request."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="order-page">
        <div className="order-success">
          <div className="success-icon">
            <CheckCircle2 size={34} />
          </div>

          <span className="section-kicker">
            REQUEST CREATED
          </span>

          <h1>Your request has been submitted.</h1>

          <p>
            CommunityOS has received your request and will
            keep you updated as it moves through the service
            workflow.
          </p>

          {success.id && (
            <div className="request-reference">
              <span>Request reference</span>
              <strong>#{success.id}</strong>
            </div>
          )}

          <div className="success-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => onCreated?.(success)}
            >
              View activity
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSuccess(null);
                setService(null);
                setForm({
                  quantity: 1,
                  notes: "",
                  location: "",
                });
              }}
            >
              Create another request
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="order-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            SERVICE REQUEST
          </span>

          <h1>Request a service</h1>

          <p>
            Tell us what you need and where it should be
            delivered or completed.
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            className="secondary-button"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="order-layout">
        <div className="order-form-card">
          <div className="order-step">
            <div className="step-number">1</div>

            <div>
              <h2>Choose your service</h2>

              <p>
                Select the service you need from your
                community catalogue.
              </p>
            </div>
          </div>

          <ServicesSelect
            token={token}
            value={service}
            onChange={setService}
            onContinue={() =>
              document
                .getElementById("order-details")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
            }
          />

          <div
            className="order-divider"
            id="order-details"
          />

          <form onSubmit={handleSubmit}>
            <div className="order-step">
              <div className="step-number">2</div>

              <div>
                <h2>Request details</h2>

                <p>
                  Give the provider enough information to
                  fulfil your request correctly.
                </p>
              </div>
            </div>

            <div className="order-fields">
              <div className="form-field">
                <label htmlFor="quantity">
                  Quantity
                </label>

                <div className="input-wrapper">
                  <Package size={18} />

                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={form.quantity}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="location">
                  Service location
                </label>

                <div className="input-wrapper">
                  <MapPin size={18} />

                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. House B12, Green Valley Estate"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label htmlFor="notes">
                  Additional notes
                </label>

                <div className="textarea-wrapper">
                  <ClipboardList size={18} />

                  <textarea
                    id="notes"
                    name="notes"
                    rows="5"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Add any useful instructions or details..."
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="order-summary">
              <div>
                <span>Selected service</span>

                <strong>
                  {service?.name ||
                    service?.title ||
                    "Not selected"}
                </strong>
              </div>

              <div>
                <span>Quantity</span>

                <strong>{form.quantity}</strong>
              </div>
            </div>

            <button
              type="submit"
              className="primary-button order-submit"
              disabled={loading || !service}
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Submitting request...
                </>
              ) : (
                <>
                  Submit request
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        <aside className="order-info-card">
          <div className="order-info-icon">
            <ClipboardList size={22} />
          </div>

          <span className="section-kicker">
            HOW IT WORKS
          </span>

          <h2>
            One request. A coordinated response.
          </h2>

          <div className="workflow-list">
            <div>
              <span>01</span>
              <p>Submit your service request.</p>
            </div>

            <div>
              <span>02</span>
              <p>
                CommunityOS routes it to the appropriate
                provider.
              </p>
            </div>

            <div>
              <span>03</span>
              <p>
                Track progress from your activity timeline.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}