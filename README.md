# HeptaReview

HeptaReview is an app designed to help manage and review knowledge cards. It provides an intuitive interface for creating, managing, and reviewing study cards, helping users learn and memorize knowledge more effectively.

## Features

- 📝 Create and manage study cards
- 📚 Organize cards by subject
- 🌙 Dark mode support
- 🔄 Real-time data synchronization
- 📱 Responsive design

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Express + TypeScript
- Database: PostgreSQL
- State Management: React Query
- Routing: Wouter
- UI Framework: Tailwind CSS

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/HeptaReview.git
   cd HeptaReview
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Modify environment variables as needed

4. Start the database:
   ```bash
   docker-compose up -d
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Requirements

- Node.js >= 18
- PostgreSQL >= 14
- Docker and Docker Compose (for local development)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details 