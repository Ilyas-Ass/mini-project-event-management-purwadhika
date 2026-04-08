# EventMU 🎟️

EventMU is a modern, full-stack event ticketing and management platform designed to provide a seamless experience for both **Event Organizers (EO)** and **Attendees**. 

The platform is designed as an **NPM Workspace Monorepo**, maintaining a clean separation between the React frontend and the Express/Prisma backend.

## 🚀 Features

### For Attendees (Customers)
* **Discover Events**: Browse available events dynamically.
* **Seamless Checkout**: Purchasing and redeeming tickets using available stock points.
* **Point Rewards (Cashback)**: Every successfully paid and confirmed ticket automatically grants 10% cashback in reward points.
* **Voucher Core**: Support for discount codes/promotions (percentage-based or fixed discounts).
* **Payment Deadline**: Real-time 2-hour countdown timer for payment proof uploads before auto-expiration.
* **E-Ticket PDF**: Direct-downloadable E-Tickets with native SVG QR Codes and clean layout styling for admission.

### For Event Organizers (EOs)
* **Event Management**: Create, edit, and publish new events and ticket variants.
* **Intelligent Proof Validation**: Admin panel to visually validate/reject customer payment proofs through a centralized modal dialog.
* **Promotions & Giveaways**: Distribute custom vouchers tailored specifically to certain events or broad platform campaigns.

### Underlying System Mechanics
* **JWT Authentication**: Full role-based user authentication spanning `attendee` and `eo`.
* **Background Workers**: Auto-cancellation and expiration of unconfirmed or unpaid tickets via `node-cron` daemon.
* **Prisma SQLite**: Solid relational database using Prisma ORM.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
* **React 18** (Vite + TypeScript)
* **Tailwind CSS v4** (Modern utility classes including `oklch` dynamic colors)
* **Zustand** (Global state management)
* **React Router DOM**
* **Lucide React** (Icons)
* **html2canvas & jsPDF** (E-Ticket generation)

### Backend (`/server`)
* **Node.js + Express**
* **Prisma ORM** (Powered by local SQLite for rapid MVP)
* **JSON Web Token (JWT)**
* **Multer** (Local file uploads for pictures and proofs)

---
