# JY Dashboard

A comprehensive dashboard application for managing Jagriti Yatra participants, tracking revenue, and analyzing data.

## Features

- 📊 **Real-time Analytics Dashboard** - Track participants, revenue, and key metrics
- 📈 **Revenue Analytics** - Detailed revenue tracking with projections and scenarios
- 🗺️ **State-wise Analysis** - Geographic distribution of participants
- 📁 **CSV Upload Support** - Bulk upload participants, priority pass holders, and submissions
- 🎯 **Seat Capacity Tracking** - Monitor available seats across categories
- 💰 **Financial Overview** - Complete financial analytics and insights
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React.js
- Chart.js for data visualization
- Tailwind CSS for styling
- React Router for navigation

### Backend
- Node.js & Express.js
- Supabase for database
- CSV parsing with Papa Parse
- RESTful API architecture

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/JYDASHBOARD.git
cd JYDASHBOARD
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:

Backend (.env):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5002
```

Frontend (.env):
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5002
```

4. Set up Supabase tables:
Run the SQL scripts in `backend/database/schema.sql` in your Supabase SQL editor.

5. Start the application:
```bash
# From root directory
npm run dev
```

This will start both backend (port 5002) and frontend (port 3000) servers.

## Usage

1. Access the dashboard at `http://localhost:3000`
2. Upload CSV files for participants data
3. View real-time analytics and insights
4. Track revenue and seat capacity
5. Analyze state-wise distribution

## Project Structure

```
JYDASHBOARD/
├── backend/
│   ├── config/         # Configuration files
│   ├── database/       # Database schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── server.js       # Express server
├── frontend/
│   ├── public/         # Static files
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts
│   │   ├── lib/        # Utilities
│   │   └── utils/      # Helper functions
│   └── package.json
└── package.json        # Root package file
```

## API Endpoints

- `GET /api/participants` - Fetch all participants
- `POST /api/participants/upload` - Upload participants CSV
- `GET /api/priority-pass` - Fetch priority pass holders
- `POST /api/priority-pass/upload` - Upload priority pass CSV
- `GET /api/submissions` - Fetch submissions
- `POST /api/submissions/upload` - Upload submissions CSV

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Jagriti Yatra team for the opportunity
- All contributors and testers