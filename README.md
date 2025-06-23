
# Kudakan - University Canteen Ordering System

A modern digital platform that connects university students with campus canteens for easy food and beverage ordering at Hasanuddin University.

![Kudakan Banner](https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80)

## 🚀 Features

### For Students (Mahasiswa)
- **Quick Ordering**: Browse menus and place orders without waiting in queues
- **Real-time Updates**: Track order status and pickup notifications
- **Profile Management**: Complete student profile with university details
- **Multiple Payment Options**: Flexible digital payment methods
- **Order History**: View past orders and reorder favorites

### For Canteen Vendors (Kantin)
- **Menu Management**: Add, edit, and manage food items and prices
- **Order Processing**: Receive and manage incoming orders
- **Inventory Control**: Track stock levels and availability
- **Sales Analytics**: Monitor sales performance and trends
- **Profile Setup**: Complete vendor registration and verification

### General Features
- **Responsive Design**: Works seamlessly on mobile and desktop devices
- **Dark/Light Theme**: Customizable theme preferences
- **Multi-language Support**: Optimized for Indonesian university environment
- **Integration Ready**: Compatible with popular delivery services (GoFood, GrabFood, ShopeeFood)

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0 with Vite
- **Styling**: Tailwind CSS with custom design system
- **Icons**: React Icons
- **Animation**: Custom CSS animations and Tailwind transitions
- **State Management**: React Hooks (useState, useEffect)
- **Authentication**: JWT-based authentication system
- **Build Tool**: Vite for fast development and optimized builds

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kudakan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🎨 Design System

### Color Palette
- **Primary Red**: `rgb(196, 30, 58)` - Brand color for CTAs and highlights
- **Accent Yellow**: `rgb(255, 215, 0)` - Secondary accent for attention
- **Success Green**: `rgb(34, 139, 34)` - Success states and confirmations
- **Neutral Colors**: Dynamic light/dark theme support

### Typography
- **Font Family**: Inter - Clean and modern typeface
- **Responsive Sizing**: Fluid typography scales across devices
- **Font Weights**: 400 (regular), 600 (semibold), 700 (bold)

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AboutSection.jsx
│   ├── DeliverySection.jsx
│   ├── Footer.jsx
│   ├── HeroSection.jsx
│   ├── KantinDashboard.jsx
│   ├── LoginModal.jsx
│   ├── MahasiswaDashboard.jsx
│   ├── MenuSection.jsx
│   ├── Navbar.jsx
│   ├── ProfileCompleteModal.jsx
│   ├── ProfileView.jsx
│   ├── ThemeProvider.jsx
│   └── Toast.jsx
├── hooks/              # Custom React hooks
│   ├── useAuth.jsx
│   ├── useTheme.jsx
│   └── useToast.jsx
├── services/           # API services
│   └── api.js
├── lib/               # Utility functions
│   └── utils.jsx
├── App.jsx            # Main application component
├── main.jsx          # Application entry point
└── index.css         # Global styles and Tailwind imports
```

## 🔧 Configuration Files

- **Tailwind Config**: Custom theme configuration with Kudakan brand colors
- **Vite Config**: Modern build tool configuration
- **ESLint Config**: Code quality and React best practices
- **PostCSS Config**: CSS processing and optimization

## 🌟 Key Components

### Authentication System
- **LoginModal**: Secure login interface for students and vendors
- **ProfileCompleteModal**: Guided profile completion process
- **useAuth Hook**: Centralized authentication state management

### Dashboard Systems
- **MahasiswaDashboard**: Student interface for ordering and profile management
- **KantinDashboard**: Vendor interface for menu and order management
- **ProfileView**: Comprehensive profile editing and viewing

### UI Components
- **ThemeProvider**: Dynamic theme switching (light/dark mode)
- **Toast**: Non-intrusive notification system
- **Navbar**: Responsive navigation with authentication states

## 🔒 Security Features

- JWT-based authentication
- Secure token storage
- Protected routes and components
- Input validation and sanitization
- CORS-enabled API integration

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Enhanced layouts for medium screens
- **Desktop Experience**: Full-featured interface for large screens
- **Touch-Friendly**: Accessible touch targets and interactions

## 🚀 Deployment

### Development
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

### Replit Deployment
This project is optimized for Replit deployment with the included `.replit` configuration file.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Frontend Development**: React and UI/UX implementation
- **Backend Integration**: API services and authentication
- **Design System**: Tailwind CSS and component architecture
- **Quality Assurance**: ESLint configuration and best practices

**Kudakan** - Making university dining convenient, one order at a time! 🍽️
