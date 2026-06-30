# GeoPals
 
GeoPals is a location-based web application built with React and Leaflet, letting users explore and interact with maps directly in the browser.
 
🔗 **Live App:** [https://geo-pals.vercel.app](https://geo-pals.vercel.app)
 
## Features
 
- Interactive maps powered by Leaflet
- Location-based exploration and markers
- Date/time handling with Day.js
- Clean, responsive UI styled with Tailwind CSS
 
## Tech Stack
 
- **Build tool:** [Vite](https://vitejs.dev)
- **Framework:** [React](https://react.dev)
- **Maps:** [Leaflet](https://leafletjs.com) (via [React-Leaflet](https://react-leaflet.js.org))
- **HTTP requests:** [Axios](https://axios-http.com)
- **Date handling:** [Day.js](https://day.js.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Deployment:** [Vercel](https://vercel.com)
This is a frontend-only project — there is no custom backend. Any data fetched via Axios comes from third-party/public APIs.
 
## Getting Started
 
### Prerequisites
 
- Node.js (v18 or higher recommended)
- npm or yarn
### Installation
 
```bash
# Clone the repository
git clone https://github.com/your-username/geo-pals.git
cd geo-pals
 
# Install dependencies
npm install
```
 
### Running Locally
 
```bash
npm run dev
```
 
The app should now be running at `http://localhost:5173` (Vite's default port).
 
### Build for Production
 
```bash
npm run build
npm run preview
```
 
## Deployment
 
This project is deployed on [Vercel](https://vercel.com). Vercel auto-detects the Vite build configuration:
 
- **Build command:** `npm run build`
- **Output directory:** `dist`
## Contributing
 
Contributions are welcome. Please open an issue or submit a pull request.
 
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a pull request

 

 