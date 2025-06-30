# naviGO - Smart Navigation App

A comprehensive navigation app built with React Native and Expo SDK 53, featuring smart route optimization, fuel cost calculation, traffic reporting, and community-driven updates.

## 🚀 Features

### 🗺️ Smart Navigation
- **Route Optimization**: Multiple route options with fuel cost calculations
- **Real-time Traffic**: Community-driven traffic updates and reports
- **Cost Analysis**: Detailed breakdown of fuel costs and tolls for each route

### 🚗 Vehicle Management
- **Car Profiles**: Manage multiple vehicles with different fuel types
- **Fuel Efficiency**: Track and optimize fuel consumption
- **Electric Vehicle Support**: Battery capacity and charging speed tracking
- **Cost Calculations**: Accurate cost per 100km calculations

### ⛽ Fuel & Charging Stations
- **Station Finder**: Locate nearby petrol stations and EV charging points
- **Real-time Availability**: Live updates on charging port availability
- **Price Comparison**: Compare fuel prices across different stations
- **Amenities**: Filter by available services (WiFi, food, restrooms)

### 📊 Traffic Reports
- **Community Reports**: User-generated traffic incident reports
- **Real-time Chat**: Discuss traffic conditions with other drivers
- **Report Types**: Police, accidents, construction, weather, and more
- **Confirmation System**: Community verification of reports

### 👤 User Profiles
- **Achievement System**: Unlock avatars based on app usage
- **Preferences**: Customize currency, region, and navigation settings
- **Dark Mode**: Beautiful light and dark theme support
- **Multi-region Support**: Localized fuel types and currencies

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router 5.0.2 with tab-based architecture
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Maps**: Google Maps integration with static maps for web
- **Styling**: StyleSheet with custom theming system
- **Icons**: Lucide React Native
- **Fonts**: Inter font family via @expo-google-fonts

## 🏗️ Architecture

### Navigation Structure
```
app/
├── _layout.tsx              # Root layout with providers
├── index.tsx               # Initial route handler
├── (auth)/                 # Authentication flow
│   ├── sign-in.tsx
│   └── sign-up.tsx
└── (tabs)/                 # Main app tabs
    ├── index.tsx           # Navigation/Map
    ├── cars.tsx           # Vehicle management
    ├── fuel.tsx           # Fuel stations
    ├── reports.tsx        # Traffic reports
    └── profile.tsx        # User profile
```

### Key Components
- **MapView**: Platform-specific map implementation (native vs web)
- **ThemeContext**: Centralized theme management
- **AuthContext**: Firebase authentication and user management
- **Database**: Firestore integration for real-time data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/navigo-app.git
   cd navigo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Building for Production

**Web Build**
```bash
npm run build:web
```

**Mobile Build**
```bash
expo build:android
expo build:ios
```

## 🌐 Deployment

### Netlify (Web)
The app is configured for automatic deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Build settings are automatically configured via `netlify.toml`
3. Set environment variables in Netlify dashboard
4. Deploy automatically on push to main branch

### Mobile App Stores
Use Expo Application Services (EAS) for mobile deployments:

```bash
eas build --platform all
eas submit --platform all
```

## 🎨 Design System

### Color Palette
- **Primary**: #3B5284 (Deep blue)
- **Secondary**: #5BA8A0 (Teal)
- **Accent**: #CBE54E (Lime green)
- **Tertiary**: #94B447 (Olive green)

### Typography
- **Font Family**: Inter (Regular, Medium, SemiBold, Bold)
- **Responsive sizing**: Scales appropriately across devices

### Themes
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on the eyes for night driving

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Set up Firestore database
4. Configure security rules
5. Add your config to environment variables

### Google Maps Setup
1. Enable Google Maps JavaScript API
2. Enable Places API
3. Enable Directions API
4. Add API key to environment variables

## 📱 Platform Support

### Web
- Responsive design for desktop and mobile browsers
- Static maps with Google Maps integration
- Progressive Web App (PWA) capabilities

### Mobile (iOS/Android)
- Native map integration with react-native-maps
- Platform-specific optimizations
- Native performance for smooth animations

## 🆕 What's New in SDK 53

- **React 19**: Latest React features and performance improvements
- **Enhanced Performance**: Better app startup times and memory usage
- **Improved TypeScript**: Better type safety and developer experience
- **New Architecture**: Support for React Native's new architecture
- **Better Web Support**: Enhanced web compatibility and features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** for the amazing development platform
- **Firebase** for backend infrastructure
- **Google Maps** for mapping services
- **Lucide** for beautiful icons
- **Pexels** for high-quality placeholder images

## 📞 Support

For support, email support@navigo-app.com or join our community Discord.

---

Built with ❤️ using React Native and Expo SDK 53