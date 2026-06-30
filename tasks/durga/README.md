# 🪐 GeoOrbit — 3D Geolocation & Spacetime Telemetry Suite

GeoOrbit is a high-fidelity, highly interactive React web application built for the **IEEE Computer Society Tasks**. It goes beyond simple location lookup to provide a complete geocentrical telemetry suite, offering side-by-side location comparisons, live weather sync, solar tracking angles, ISS orbital pass telemetry, and submarine internet cable route simulations.

🔗 **Live Hosted URL**: [https://geoorbitdurga.netlify.app/](https://geoorbitdurga.netlify.app/)

✍️ **Developer**: Durga Prasad Mahapatra

---

## 🚀 Key Features & Custom Engineering

### 1. 🌍 Interactive 3D Satellite Globe
* **High-Fidelity Satellite Texture**: Features a realistic, detailed equirectangular satellite texture map.
* **3D Geocoordinate Projection**: Automatically projects Latitude/Longitude coordinates into Three.js Cartesian 3D coordinates, pinning the nodes and connecting them with a glowing, animated curve line.
* **Interactive Controls**: Supports full orbit rotation, drag, and zoom capabilities.

### 2. 🗺️ 2D Street Map Node Viewer
* Integrates custom dark-themed `react-leaflet` mapping tiles.
* Draws custom themed marker pins for both friends and links them with a vector route line.

### 3. ☀️ Solar Position & Clocks (Chronology)
* **Live Day.js time offsets**: Displays live clocks showing local time and difference offsets.
* **Solar Altitude Zenith Tracking**: Uses local hours and longitudes to estimate the real-time Solar Zenith Angle, displaying dynamic astronomy status badges (like `☀️ Apex Day`, `🌅 Golden Hour`, `🌌 Twilight`, or `🌙 Deep Night`).

### 4. 🛰️ ISS Orbital Pass Telemetry
* Simulates and displays a live overpass countdown timer for the **International Space Station (ISS)** directly over both friends' skies.
* Provides the altitude, velocity, and the look-angle vector (Elevation and Direction) in real-time.

### 5. 🔌 Submarine Cable Traceroute Simulator
* Connects network engineering with geography by running a simulated packet traceroute between the two IP addresses.
* **Undersea Cables**: Automatically maps traffic across real transatlantic or transpacific submarine fiber cables (e.g. *TAT-14 Atlantic*, *Unity Pacific*) depending on geographical country codes.
* Displays RTT latencies calculated relative to speed-of-light propagation in glass fiber.

### 6. 🛡️ Robust Form Verification & Data Export
* **Smart Validation**: Provides real-time tooltips checking both IPv4 and IPv6 formatting.
* **Comparison Report**: Downloads detailed geodata, solar tracking, and space metrics as a neat text file summary.

---

## 🛠️ Technology Stack

* **Framework**: React (Vite)
* **3D Graphics**: Three.js / WebGL
* **Maps**: Leaflet & React Leaflet
* **Styling**: Tailwind CSS & Vanilla CSS
* **Date & Time**: Day.js (with UTC & timezone plugins)
* **Icons**: React Icons (Fi icons)

---

## 📦 Local Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```
3. **Compile Production Build**:
   ```bash
   npm run build
   ```
