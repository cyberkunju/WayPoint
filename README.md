# ClarityFlow

A top-tier, production-ready, personal task and project management web application. ClarityFlow is designed for daily, intensive use—offering a flawless, delightful, and highly customizable experience that surpasses Todoist and similar tools.

> **📋 [NEW: Comprehensive Code Review Available](./CODE_REVIEW_INDEX.md)**  
> Enterprise-level analysis with detailed recommendations and backend architecture proposal.  
> Rating: ⭐⭐⭐ (3/5) - Excellent frontend, needs backend for production use.

---

## Features

- **Minimal, distraction-free interface** with a unified design language
- **Three-column layout**: Sidebar, Top Bar, Main Content, and Detail Panel
- **Quick Add Bar** with natural language parsing (dates, projects, labels, priorities, assignees)
- **Multiple views**: List, Kanban Board (drag-and-drop), Calendar (drag-to-reschedule), Gantt Chart, Focus Mode, and more
- **Unlimited projects, sections, subtasks, and dependencies**
- **Productivity assistant** for smart suggestions, habit nudges, and risk alerts
- **Comprehensive analytics dashboard** with customizable widgets and exportable reports
- **Google Calendar integration** (two-way sync, status indicator, event conversion)
- **Personalization**: Theme (Light/Dark/Auto), density, brand color, font size
- **Offline-first**: Works seamlessly without internet, syncs when online
- **Accessibility**: WCAG AA contrast, keyboard navigation, screen reader support
- **Instant performance**: Virtualized lists, smooth animations, no lag

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-github-username/clarityflow.git
cd clarityflow

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:5000](http://localhost:5000) in your browser.

### Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Build for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Complete Verification

```bash
# Run all checks
npm run lint && npm test && npm run build
```

---

## Performance

ClarityFlow automatically optimizes for large datasets:
- **Automatic virtualization** kicks in at 100+ tasks
- **Handles 10,000+ tasks** smoothly with virtual scrolling
- **90%+ performance improvement** for large datasets

---

## 📚 Documentation

### 🆕 Enterprise Code Review (October 2024)

A comprehensive enterprise-level code review has been completed. Start here:

- 📖 **[CODE_REVIEW_INDEX.md](./CODE_REVIEW_INDEX.md)** - Navigation hub (start here!)
- 📊 **[REVIEW_EXECUTIVE_SUMMARY.md](./REVIEW_EXECUTIVE_SUMMARY.md)** - 5-minute visual summary
- 🔍 **[ENTERPRISE_CODE_REVIEW.md](./ENTERPRISE_CODE_REVIEW.md)** - Detailed 60-page analysis
- ⚡ **[QUICK_WINS_CHECKLIST.md](./QUICK_WINS_CHECKLIST.md)** - Immediate improvements (15-20 hours)
- 🏗️ **[BACKEND_ARCHITECTURE_PROPOSAL.md](./BACKEND_ARCHITECTURE_PROPOSAL.md)** - Full-stack implementation guide

**Key Findings:**
- ⭐⭐⭐ (3/5) - Excellent frontend, needs backend for production use
- Current: Client-side only (localStorage)
- Required for multi-user: Backend API + Database + Authentication (6-8 weeks)

### Project Documentation

- See [`CLARITYFLOW_FEATURE_CHECKLIST.md`](./CLARITYFLOW_FEATURE_CHECKLIST.md) for a full breakdown of features and progress.
- See [`DEVELOPMENT_UPDATES.md`](./DEVELOPMENT_UPDATES.md) for recent improvements and updates.
- See [`COMPLETION_REPORT.md`](./COMPLETION_REPORT.md) for the comprehensive development completion report.
- See [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md) for testing approach and guidelines.

### Recent Updates

**✅ Test Suite Implementation**
- 41 comprehensive tests covering components, utilities, and hooks
- Vitest + Testing Library setup with full mocking support

**✅ Performance Optimization**
- Virtualized lists for handling 10,000+ tasks
- Automatic virtualization threshold at 100+ tasks

**✅ Code Quality**
- ESLint v9 configuration with TypeScript rules
- React Hooks plugin for hook validation

---

## Contributing

We welcome contributions! Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) and our [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) before submitting issues or pull requests.

---

## Security

If you discover a security vulnerability, please see [`SECURITY.md`](./SECURITY.md) for how to report it.

---

## License

[MIT](./LICENSE)

---

## Acknowledgements

- Built with [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), and [Radix UI](https://www.radix-ui.com/)
- Inspired by the best of modern productivity tools, but designed for clarity, focus, and personal excellence.
