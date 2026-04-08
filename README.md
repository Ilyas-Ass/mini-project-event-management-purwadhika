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

## 💻 Local Setup & Installation

### 1. Requirements
Ensure you have the following installed remotely or natively:
* Node.js (v18 or higher recommended)
* NPM / PNPM

### 2. General Installation
Open your terminal in the project root directory (`eventmu`) and install the workspace dependencies:

```bash
npm install
```

### 3. Backend Configuration
Navigate to the server directory and configure your environments.

```bash
cd server
```

1. **Setup Environment**: Copy or create a `.env` file inside `/server`, applying the required configuration:
   ```env
   # /server/.env
   PORT=5000
   DATABASE_URL="file:./prisma/dev.db"
   JWT_SECRET="YOUR_SUPER_SECRET_KEY"
   ```

2. **Initialize Database**: Map and sync Prisma's architecture to the SQLite database:
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Upload Directories**: (Optional, typically handled automatically by Multer)
   Ensure that a `public/uploads` directory exists inside `/server` if you receive directory-not-found errors on image upload.

### 4. Running the Development Environments

You can start **both** environments securely from the root directory using NPM workspace execution commands:

To run the backend server natively (Port `5000`):
```bash
npm run dev -w server
```

To run the frontend dev environment natively (Port `5174` typically):
```bash
npm run dev -w client
```

Now, navigate to your localhost (e.g. `http://localhost:5174`) in your browser. You're ready to host your own events!

---

## 📅 Roadmap & Next Steps
- Migration from bare SQLite mapping to PostgreSQL (Supabase/Neon) for production scaling.
- Replace internal Multer directory structure with AWS S3 / Cloudinary for cloud thumbnail hosting.
- Set up SendGrid or NodeMailer to automate ticket emailing.
