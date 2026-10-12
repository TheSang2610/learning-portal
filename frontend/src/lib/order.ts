import type { Order, OrderCourse } from "@/src/services/order";

/** Moi khoa trong don: don gio hang doc `courses`, don mua le chi co `course`. */
export const coursesInOrder = (order: Order): OrderCourse[] =>
  order.courses?.length ? order.courses : order.course ? [order.course] : [];
