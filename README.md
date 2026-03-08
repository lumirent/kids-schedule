# Kids Schedule (자녀 등하원 일정 관리 서비스)

Kids Schedule is a local-first, privacy-focused scheduling application designed for parents to manage complex academy and shuttle schedules for multiple children. It prioritizes offline usability, ease of sharing via encoded URLs, and a mobile-first user experience.


## Features

- **Local-First & Privacy-Focused**: All primary data is stored seamlessly within your browser (IndexedDB via Dexie.js). No accounts, no cloud dependencies by default.
- **Advanced Scheduling**: Supports date-based events, specific day-of-week recurring schedules, and group editing/deletion.
- **Drag & Drop**: Easily intuitively reorder or manage schedules on a weekly timeline view.
- **URL-based Sharing**: Schedules can be safely encoded into a compressed Base64 string and shared via URL. Recipients enter a "Viewer Mode" for read-only access.
- **Mobile-First Design**: Optimized for mobile viewports, featuring glassmorphism elements, smooth animations, and a modern app-like feel.
- **PWA Ready**: Installable as a Progressive Web App for offline access and native-like experience.
- **Dark Mode**: Comes with built-in dark mode and theme persistence.
- **i18n Support**: Currently supports Korean and English translations.

## Technologies Used

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5 + LocalStorage Persist
- **Database**: Dexie.js (IndexedDB)
- **Utilities**: `pako` (Zlib compression), `@hello-pangea/dnd` (Drag & Drop), Lucide React (Icons)
- **Testing**: Vitest

## Getting Started

### Prerequisites

You need `pnpm` installed to manage dependencies.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/kids-schedule.git
cd kids-schedule
pnpm install
```

### Development Server

Run the development server locally:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build & Production Status

To build the application for production:

```bash
pnpm build
pnpm start
```

### Testing

Run the automated test suite using Vitest:

```bash
pnpm test
```

## License

MIT
