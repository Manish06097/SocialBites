
# Surat Social Bites: The Food Court Revolution

**Tagline:** The Entire Food Court, In Your Pocket.

## 1. Introduction: The Vision

Surat Social Bites is a progressive web application meticulously engineered to transform the chaotic, queue-filled food court experience into a seamless, modern, and socially integrated dining adventure. Born from the vibrant food culture of Surat, this platform targets the tech-savvy Gen Z and millennial diner who values convenience, choice, and shared experiences.

Our core mission is to eliminate the friction of traditional food court ordering. We replace the frustrating cycle of finding a table, leaving jackets to reserve it, queuing at multiple stalls, juggling different payments, and waiting for buzzers with a single, elegant solution. By scanning a QR code, customers unlock the entire food court's culinary offerings on their smartphone, creating a unified, multi-stall "running tab" for their table.

For vendors, Surat Social Bites is not just an ordering system; it's a powerful, real-time business management tool. It provides an intuitive dashboard to manage orders, update menus, and engage with customer feedback, all from a simple interface that works on any device.

This document serves as a comprehensive guide to the application's philosophy, features, technical architecture, and user workflows.

---

## 2. Core Concepts & Philosophy

The application is built on four foundational pillars that guide its design and functionality.

### a. The Unified Cart: A Food Festival on Your Phone

This is the cornerstone of the Surat Social Bites experience. We treat the entire food court as a single, unified marketplace.

*   **Multi-Stall Ordering:** Customers are not limited to one stall per transaction. They can add a Pizza from one vendor, a Gujarati snack from another, and a milkshake from a third, all into a single, persistent shopping cart.
*   **The Running Tab:** The system introduces a "running tab" for each table. As long as a table has an order that has not been formally paid for and marked `completed`, any new item ordered by a user at that table—even if the first items have already been delivered—is appended to the *same* master order. This mirrors the familiar experience of a restaurant tab, simplifying the process for both the customer and the vendor.
*   **Unified Checkout:** The entire multi-stall order is paid for in a single, streamlined checkout process. This consolidation is the primary value proposition, turning a fragmented experience into a cohesive culinary event.

### b. Frictionless Onboarding: From Scan to Menu in Seconds

We believe in getting users to the food as quickly as possible, which means dismantling the barrier of mandatory registration.

*   **QR Code as the "Magic Link":** The entire user journey begins with a QR code unique to each table. This scan provides the application with three critical pieces of context: the `foodCourtId`, the `stallId` (of the nearest stall), and the `tableId`.
*   **Instant Guest Access:** Upon scanning, a new user is not forced to create an account. They can immediately proceed as a guest, creating a temporary anonymous session that is fully capable of browsing, ordering, and paying.
*   **Intelligent Session Handling:** If an existing user (guest or registered) scans a code at a new table, the system simply updates their session with the new location information without interrupting their flow.

### c. Real-Time, Role-Specific Interfaces

The platform provides two distinct, tailored experiences for its primary users: customers and vendors. Both interfaces are powered by real-time updates to ensure all information is current without needing a page refresh.

*   **For Customers:** The interface is focused on discovery, ordering, and tracking. Real-time updates mean they see the status of their food change from "Accepted" to "Preparing" to "Delivered" live.
*   **For Vendors:** The vendor dashboard is a mission control for their stall. It separates the cognitive load of different tasks into specific views:
    *   **Order Management:** A view focused on customer orders and payment.
    *   **Kitchen Queue:** A focused, "items-only" view for chefs, showing only what needs to be cooked *right now*.
    *   **Menu & Profile Management:** Simple tools for instant updates.

### d. Vendor Empowerment: Simplicity and Control

We empower local food entrepreneurs with tools previously only available to large restaurant chains.

*   **Real-Time Menu Control:** A vendor can mark an item as "Sold Out" with a single toggle, and this change is instantly reflected on the customer-facing menu, preventing customer frustration.
*   **Granular Order Management:** The ability to manage each item's status individually gives vendors precise control over their workflow and provides customers with accurate, granular tracking.
*   **Data-Driven Insights:** The dashboard provides at-a-glance analytics on daily revenue, best-selling items, and peak business hours, helping vendors make smarter decisions.

---

## 3. Customer Workflow: A Seamless Journey

The customer journey is designed to be intuitive, fast, and delightful.

#### **Step 1: Onboarding via QR Scan**
*   A customer sits at a table and scans the QR code.
*   They are redirected to the `/scan` page, which immediately forwards them to `/welcome` with the table's context (`foodCourtId`, `stallId`, `tableId`) as URL parameters.
*   The `/welcome` page intelligently handles the session:
    *   **Existing Session:** If the user is already logged in (even as a guest), their `tableInfo` in `localStorage` is updated, and they are seamlessly redirected to the stall listing page (`/stalls`).
    *   **No Session:** The user is presented with two clear options: "Continue as Guest" or "Login / Sign Up". Either choice creates a session and stores the table information before proceeding.

#### **Step 2: Discovery and Browsing**
*   The user lands on the `/stalls` page, a visually rich, scrollable grid of all stalls in their current food court.
*   A prominent search bar allows them to find specific stalls or dishes.
*   Category filters (e.g., "Pizza," "Chinese") allow for quick navigation.
*   Tapping a `StallCard` takes them to the stall's dedicated menu page (`/stalls/[stallId]`).
*   The menu is organized by categories (e.g., "Appetizers," "Main Course"). A floating action button on mobile allows for quick navigation between these categories.

#### **Step 3: Ordering and Customization**
*   Each `MenuItemCard` displays the item's photo, name, price, rating, and social proof (e.g., "100+ ordered").
*   Clicking "Add" opens the `MenuItemDialog`, where users can:
    *   Adjust the quantity.
    *   Select from available customizations (e.g., spice level, crust type), with real-time price adjustments.
    *   Add special text instructions.
*   Adding to the cart places the item in a global `CartProvider` state.

#### **Step 4: The Unified Cart & Checkout**
*   The user can open their cart at any time via the bottom navigation bar.
*   The `CartSheet` displays all items, conveniently grouped by the stall they are from.
*   Users can adjust quantities or remove items directly from the cart.
*   The `/checkout` page provides a final summary.
    *   If the user is a guest, they are prompted for a name and phone number.
    *   If they are a registered user, this information is pre-filled from their profile.
*   Currently, "Cash on Delivery" (COD) is the primary payment method. The user confirms their order.

#### **Step 5: Order Tracking and Review**
*   After checkout, the user is redirected to the `/orders` page.
*   This page is split into two sections: "Latest Orders" and "Past Orders".
*   An active order card displays the master order ID and provides granular, real-time status updates for each item within it.
*   Once all items in an order are delivered and paid for, the order card moves to the "Past Orders" section.
*   Users can leave star ratings and written reviews for items from their completed orders.

---

## 4. Vendor Workflow: A Powerful Command Center

The vendor dashboard is designed for efficiency and clarity, enabling stall owners to manage their operations on the fly.

#### **Step 1: Login and Authentication**
*   Vendors use a separate login portal at `/vendor/login`.
*   A successful login verifies that the user's ID is associated with a `stall` in the database. If not, access is denied. This ensures only legitimate owners can access a dashboard.

#### **Step 2: The Dashboard Overview**
*   The landing page (`/vendor/dashboard`) is a real-time snapshot of the day's business, showing:
    *   Today's Revenue
    *   Total Orders & New Orders
    *   Average Order Value
    *   A list of the day's best-selling items.
    *   A bar chart visualizing peak order hours.

#### **Step 3: Order Management (The Core Loop)**
*   The `/vendor/dashboard/orders` page is the hub of activity. It features three tabs:
    1.  **Active:** This is the default view. It shows all orders that are currently in progress. An order remains here until every single item is `delivered` or `rejected`.
    2.  **Kitchen Queue:** This is a specialized view for chefs. It displays a de-normalized list of every individual item that has been `accepted` and is currently in the `preparing` status. Each item is a "ticket" showing what to make, quantity, and customizations. This allows the kitchen to focus purely on production.
    3.  **Completed:** Shows all fully delivered and rejected orders from the current day for historical reference.

*   **The Workflow for an Item:**
    1.  A new item appears in an "Active" order card with a `pending` status.
    2.  The vendor clicks **"Accept"**. The item's status changes to `accepted`.
    3.  The vendor clicks **"Mark as Preparing"**. The item's status changes to `preparing`, and it simultaneously appears as a ticket in the "Kitchen Queue" tab.
    4.  From either the main card or the kitchen queue ticket, the vendor clicks **"Mark as Delivered / Food Ready"**. The item's status changes to `delivered`, and it is removed from the kitchen queue.

#### **Step 4: Handling Payments**
*   Once all items in an order are in a `delivered` state, a **"Confirm COD Payment Received"** button appears on its card in the "Active" tab.
*   Clicking this button triggers the final state change:
    *   The order's `payment_status` becomes `completed`.
    *   The order's master `status` becomes `completed`.
    *   The status of all items within the order becomes `completed`.
*   The order card then moves to the "Completed" tab.

#### **Step 5: Menu and Profile Management**
*   **/vendor/dashboard/menu:** A simple but powerful interface to manage the stall's menu. Vendors can:
    *   Add, edit, or delete menu items.
    *   Set names, descriptions, prices, and categories.
    *   Upload images for each item.
    *   Define complex customizations (single-choice radio buttons or multiple-choice checkboxes) with price modifiers.
    *   Toggle item availability (`Available`/`Sold Out`) in real-time.
*   **/vendor/dashboard/profile:** Vendors can update their stall's name, descriptive tags, logo, and banner image.
*   **/vendor/dashboard/qr:** A utility to generate and download table-specific QR codes for their stall.

---

## 5. Technical Architecture & Key Components

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS with ShadCN UI components for a modern, accessible, and themeable design system.
*   **Database & Real-time:** Supabase is used for PostgreSQL database, authentication (including guest/anonymous sessions), and real-time updates via its Pub/Sub capabilities.
*   **State Management:** React Context API is used for managing global state like the shopping cart (`CartProvider`) and the currently selected food court (`FoodCourtProvider`). Client-side state is managed with `useState`, `useEffect`, etc.
*   **Server Actions:** All mutations (creating orders, updating statuses, saving menu items) are handled through Next.js Server Actions, providing a secure way to interact with the database from the client without writing separate API endpoints.
*   **Deployment:** Ready for deployment on Firebase App Hosting.

This robust and thoughtful architecture ensures a scalable, maintainable, and highly performant application, ready to redefine the dining experience in Surat's food courts.
