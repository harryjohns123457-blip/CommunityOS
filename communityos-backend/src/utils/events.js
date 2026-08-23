/**
 * Event-driven architecture utilities
 * Used to emit and handle domain events across the system
 */

const eventHandlers = new Map();

export function on(eventName, handler) {
  if (!eventHandlers.has(eventName)) {
    eventHandlers.set(eventName, []);
  }
  eventHandlers.get(eventName).push(handler);
}

export async function emit(eventName, payload) {
  const handlers = eventHandlers.get(eventName) || [];
  await Promise.all(handlers.map((handler) => handler(payload).catch(console.error)));
}

export const EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_ACCEPTED: 'order:accepted',
  ORDER_ASSIGNED: 'order:assigned',
  ORDER_IN_PROGRESS: 'order:in_progress',
  ORDER_COMPLETED: 'order:completed',
  ORDER_CANCELLED: 'order:cancelled',
  PAYMENT_INITIATED: 'payment:initiated',
  PAYMENT_COMPLETED: 'payment:completed',
  PAYMENT_FAILED: 'payment:failed',
};
