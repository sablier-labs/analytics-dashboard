# Sablier Analytics Dashboard

A modern Next.js analytics dashboard for Sablier protocol metrics, tracking token distribution, vesting, payroll,
airdrops, grants, and more.

## Features

- **Real-time Analytics**: Monthly Active Users tracking with interactive charts
- **Protocol Metrics**: Total Value Locked, Streams, Users, and Volume metrics
- **Use Case Breakdown**: Detailed analytics for vesting, payroll, airdrops, and grants
- **Multi-chain Support**: Ethereum, Polygon, Arbitrum, Base, and Optimism
- **Responsive Design**: Professional dashboard optimized for analytics usage
- **TypeScript**: Fully typed with comprehensive type safety

## Tech Stack

- **Framework**: Next.js 15.3.3 with App Router
- **UI**: React 19, TailwindCSS v4
- **Charts**: Chart.js with react-chartjs-2
- **Development**: BiomeJS, TypeScript 5, Bun
- **Quality**: Husky, lint-staged, @sablier/devkit

## Development

### Prerequisites

- [Bun](https://bun.sh) (recommended package manager)
- Node.js ≥20

### Setup

```bash
# Install dependencies
bun install

# Start development server
just dev
# or: bun run dev

# Build for production
just build
# or: bun run build
```

### Available Commands

```bash
just dev         # Start development server
just build       # Build for production
just start       # Start production server
just clean       # Clean .next directory
just biome-check # Check code formatting and linting
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                 # Base UI components
│   ├── charts/             # Chart components
│   └── dashboard/          # Dashboard components
├── lib/
│   ├── data/              # Mock data and providers
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
└── hooks/                 # Custom React hooks
```

## Mock Data

Currently using realistic mock data for development. The architecture supports easy integration with real Sablier
protocol APIs through the data provider interface.

## Contributing

1. Follow the established code style (BiomeJS configuration)
2. Use TypeScript strict mode
3. Write descriptive commit messages
4. Test changes locally before committing

## License

This project is part of the Sablier ecosystem. 
