# FixIt Pro

A professional mobile application for recruiting and booking home service professionals (plumbers & electricians), built with Expo React Native.

## Tech Stack

- **Frontend**: Expo React Native with Expo Router (file-based routing)
- **Backend**: Express.js (TypeScript)
- **State**: AsyncStorage for local persistence, React Context for shared state
- **Fonts**: Poppins (@expo-google-fonts/poppins)
- **UI**: react-native-reanimated, expo-linear-gradient, expo-blur, @expo/vector-icons

## App Architecture

### User Roles
- **Customer**: Browse providers, book services, chat, track bookings
- **Service Provider**: Manage jobs, set schedule, view earnings

### Routing Structure
```
app/
  _layout.tsx          # Root layout with all providers + font loading
  index.tsx            # Auth redirect (loading screen)
  onboarding.tsx       # Role selection (customer / provider)
  (auth)/
    _layout.tsx        # Modal auth stack
    login.tsx
    register.tsx
  (customer)/
    _layout.tsx        # Customer tab bar (NativeTabs iOS26+ / Classic)
    index.tsx          # Home - browse providers by city & type
    bookings.tsx       # My bookings (upcoming/completed/cancelled)
    chats.tsx          # Chat list
    profile.tsx        # Customer profile & stats
  (provider)/
    _layout.tsx        # Provider tab bar
    index.tsx          # Incoming jobs
    schedule.tsx       # Availability management
    earnings.tsx       # Earnings dashboard
    profile.tsx        # Provider profile
  provider-detail.tsx  # Provider detail page
  booking.tsx          # Date/time selection & booking confirmation
  chat-room.tsx        # Individual chat conversation
```

### Context / State
- `context/AuthContext.tsx` - User auth, role, login/register/logout
- `context/BookingsContext.tsx` - Booking CRUD with AsyncStorage
- `context/ChatContext.tsx` - Chat messages with auto-reply simulation

### Shared Components
- `components/Avatar.tsx` - Initials avatar with color
- `components/RatingStars.tsx` - Star rating display
- `components/ServiceBadge.tsx` - Plumber/Electrician badge
- `components/StatusBadge.tsx` - Booking status badge
- `components/ProviderCard.tsx` - Provider listing card
- `components/BookingCard.tsx` - Booking summary card

### Mock Data
- `constants/mockData.ts` - 8 providers across Indian cities
- `constants/colors.ts` - Dark theme color palette

## Design

- **Theme**: Dark professional (navy, electric blue, orange accent)
- **Font**: Poppins (400, 500, 600, 700)
- **Navigation**: NativeTabs (iOS 26+ liquid glass) / Classic BlurView tabs
- **Market**: India-focused (₹ pricing, Indian cities, Indian provider names)

## Running the App

- **Frontend**: `npm run expo:dev` (port 8081)
- **Backend**: `npm run server:dev` (port 5000)

## Features

1. Role-based onboarding (Customer / Service Provider)
2. Customer: Browse providers with city/type filters
3. Customer: View provider profiles with skills, reviews, ratings
4. Customer: Book services with date/time selection
5. Customer: Real-time booking status tracking
6. Customer: In-app chat with providers
7. Provider: View and accept/reject job requests
8. Provider: Set availability (days and time slots)
9. Provider: Track earnings and completed jobs
10. Provider: Manage profile and toggle availability
