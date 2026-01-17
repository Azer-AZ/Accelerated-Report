# Accelerated Report App ⚡

**Accelerated Report App** is a fast and reliable in-app reporting system that helps users submit bug reports and feedback in **under 10 seconds**, while guaranteeing that reports are **never lost**.

The app is fully instrumented with **Sentry** to monitor **critical user experiences**, capture errors and performance issues, and help developers fix problems faster.

---

## 🚩 The Problem

Users rarely submit reports because:

* reporting is slow and annoying
* they don’t know what details to include
* submissions fail silently

Developers end up with poor feedback and hard-to-debug issues.

---

## ✅ The Solution

Accelerated Report App:

* makes reporting **quick and frictionless**
* automatically captures technical context
* guarantees delivery even during failures
* uses observability (Sentry) to ensure reliability

---

## ✨ Key Features

* ⚡ **Accelerated reporting** (1 dropdown + 1 text field)
* 🔒 **Offline-safe queue** (reports retry automatically)
* 📊 **Critical experience monitoring** with Sentry
* 🧠 **Optional AI enrichment** (summary, severity, category)
* 🧪 **Chaos Mode** to simulate failures during demo

---

## 🔍 Why Sentry Is Core

Sentry is used to:

* define and monitor the **critical experience**: `report.submit`
* trace the full reporting flow end-to-end
* capture errors, slowdowns, and retries
* connect logs, traces, and metrics in one place
* ensure the system never fails silently

This project is built specifically to demonstrate **Best Use of Sentry**.

---

## 🧠 Architecture

```
Demo Web Page
     |
     v
FastAPI Backend
     |
     ├── SQLite (store reports)
     ├── AI enrichment (Gemini)
     ├── Similarity search (Yellowcake)
     |
     v
Sentry (errors • traces • metrics)
```

---

## 🖥️ Demo

* **Web page** simulates in-app “Report a problem”
* **Developer dashboard** shows submitted reports
* **Chaos Mode** simulates network and service failures
* Sentry dashboard shows traces, errors, and metrics live

---

## 🛠 Tech Stack

**Backend**

* Python
* FastAPI
* SQLite
* Sentry SDK

**Frontend**

* HTML / CSS / JavaScript
* Fetch API
* LocalStorage (offline queue)

**Observability**

* Sentry (Errors, Performance, Metrics, Tracing)

---

## ▶️ Run Locally

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

Open `frontend/index.html` in your browser.

---

## 🔐 Environment Variables

Create `backend/.env`:

```env
SENTRY_DSN=your_sentry_dsn_here
```

⚠️ Do not commit real secrets.

---

## 🎯 Hackathon Goal

To show how **Sentry can be used to monitor critical user experiences**, not just collect logs, and how observability can directly improve reliability and user trust.

---

## 👥 Team

Built by a 3-person team for a hackathon project.

---

If you want next, I can:

* shorten this even more (ultra-minimal README)
* add **screenshots placeholders**
* or write a **judge-facing demo script** word for word
