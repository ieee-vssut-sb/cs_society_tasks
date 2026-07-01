# 🌍 Meridian — Geolocation, Coordinate Comparator & Threat Intelligence Platform

> **🚀 Live Demo**: [https://meridian-ochre-ten.vercel.app/](https://meridian-ochre-ten.vercel.app/)

Meridian is a high-fidelity, highly interactive React 19 web application built for the **IEEE Computer Society Tasks**. It goes beyond simple location lookup to provide a complete geospatial suite, offering side-by-side location comparisons, network threat reputation analysis, and secure authentication.

### 🎯 The Challenge & Goal
> Build a responsive React web application that allows users to compare the geographical locations of two friends using their IP addresses. The application should fetch location details from an IP Geolocation API, calculate the real-world distance between them, visualize both locations on an interactive map, and provide useful contextual information such as weather conditions and timezone differences.
>
> The goal is to create an engaging frontend application that demonstrates API integration, geolocation, mapping, asynchronous programming, data visualization, and responsive UI design.

---

## 🎁 Core Application Modules & Sections

### 1. 🌌 Hero / Cosmic Landing Page
* **Parallax Scroll Earth**: Features a high-fidelity, custom-filtered looping earth video backdrop with a dynamic CSS parallax shift as the user scrolls.
* **Ambient Glow Backdrops**: Utilizes multiple overlapping radial and linear gradient glows (warm purples, cosmic cyans) to simulate digital space.
* **Backlit Glowing Typography**: Highlights the "Meridian" wordmark using drop-shadow filters on custom metallic text gradients.

### 2. 🗺️ Geolocation & Coordinate Comparator (`/compare`)
* **Side-by-Side Analysis**: Resolves two IP addresses concurrently, displaying detailed ISP info, timezone, zip code, and local time.
* **Great-Circle Calculator**: Uses the **Haversine formula** to calculate the exact real-world distance between coordinate points in both kilometers and miles.
* **Midpoint & Antipode Finder**: Calculates the exact coordinates for the geographical midpoint and the antipode (the opposite side of the globe) for the origin point.
* **Bearing & Travel Time Projection**: Computes the exact bearing angle for transit direction and projects travel times across multiple mediums (e.g. Flight, Train, Walking, Driving, Soundwave, Lightwave).
* **Interactive Map**: Integrates `react-leaflet` to display custom glowing node markers (green for origin, orange for destination, gold for midpoint) with dotted connecting path vectors.

### 3. 🛡️ Threat Radar Reputation Scanner (`/threat-radar`)
* **Reputation Trust Score**: Computes a dynamic integrity score (0 to 100) based on network flags.
* **VPN, Proxy & Hosting Detection**: Identifies whether the IP address belongs to an anonymous VPN/Proxy, or is hosted inside a datacenter.
* **Network & ASN Intelligence**: Scans and parses Autonomous System Numbers (ASN), organization owners, and Reverse DNS (PTR) records.
* **History Registry**: Saves scanning history in `localStorage`, letting you inspect past scans, view their statistics, and trigger instant re-scans.

### 4. 🔐 Security Vault & Authenticator (`/login`)
* **Firebase Authentication**: Ready-to-go Google Sign-In popups using real Firebase client config.
* **Local Vault Fallback**: If offline or if no Firebase keys are configured, the app automatically boots up a secure local mockup system using `localStorage` user encryption, meaning **no credentials are required to run and test the app**.
* **Protected Routes**: Restricts sensitive pages (`/compare`, `/history`, `/threat-radar`) to logged-in users.

---

## 🔌 API Integrations Used

### 1. Public IP Retrieval
* **Endpoint**: `https://api.ipify.org?format=json`
* **Usage**: Automatically retrieves the user's external public IP on load to pre-populate the origin point.

### 2. IP Geolocation API (IP-API)
* **Endpoint**: `http://ip-api.com/json/{IP_ADDRESS}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query`
* **Usage**: Provides coordinates, local ISP name, ASN routing data, reverse DNS logs, and mobile/proxy/hosting flags.

### 3. Open-Meteo Weather API
* **Endpoint**: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
* **Usage**: Retreives live temperature, humidity, wind conditions, and weather codes to map current weather to local nodes.

---

## 🛠️ Technology Stack & Dependencies

* **Core Framework**: React 19 (JSX) & Vite
* **Styling**: Tailwind CSS & Vanilla CSS (glowing borders, blur backdrops, keyframe animations)
* **HTTP Client**: Axios (for concurrent API calls)
* **Map Library**: Leaflet & React Leaflet (renders dark-themed canvas tile layers)
* **Date & Time Utilities**: Day.js
* **Icons**: Lucide React & React Icons

---

## 🚀 Getting Started

### Prerequisites
* Node.js installed on your machine.
* `pnpm` (recommended) or `npm`.

### Installation
Install the project dependencies from the root directory:
```bash
npx pnpm install
```

### Running Locally
To launch the development server, set the required environment variables (`PORT` and `BASE_PATH`) and run the Vite dev script:
```bash
$env:PORT="5173"; $env:BASE_PATH="/"; npx pnpm --filter @workspace/meridian dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser to view the application.

### Building for Production
To build the optimized static asset bundle:
```bash
$env:PORT="5173"; $env:BASE_PATH="/"; npx pnpm --filter @workspace/meridian build
```
The output will be generated inside the `dist/public/` folder.
