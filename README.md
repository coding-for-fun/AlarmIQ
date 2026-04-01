# AlarmIQ

A React Native mobile app that lets technicians scan alarm panel displays with their phone camera and instantly look up fault code explanations and recommended actions.

## What it does

**Scanner** — Point your camera at an alarm panel showing fault codes, tap Scan, and AlarmIQ uses OCR to read the codes and display a description plus action steps. If multiple codes are detected, you can pick the one you want.

**Code Browser** — A searchable list of every alarm code in the database. Tap any entry to expand it and see the recommended action.

## Supported alarm code categories

| Category | Examples |
|---|---|
Add ur codes

## Tech stack

- [Expo] (SDK 54) with Expo Router
- React Native 0.81
- `expo-camera` + `expo-text-recognition` for OCR scanning
- `react-native-vision-camera` for advanced camera support
- TypeScript

## Getting started

### Prerequisites

- Node.js 18+
- Android device/emulator or iOS device/simulator

### Install

```bash
npm install
```

### Run

```bash
# Start Expo dev server
npm start

# Android
npm run android

# iOS
npm run ios
```

## Adding alarm codes

All codes live in [data/alarm-codes.ts](data/alarm-codes.ts). Add an entry to the `ALARM_CODES` array:

```ts
{
  code: 'FA06',
  description: 'Fire Alarm - Car Park (Zone 6)',
  category: 'Fire',
  action: 'Evacuate building. Check car park level.'
}
```

The scanner automatically picks up new codes — no other changes needed. Matching is case- and space-insensitive, so `"FA 06"` will match `"FA06"`.

## Project structure

```
app/
  (tabs)/
    index.tsx       # Camera scanner screen
    explore.tsx     # Alarm code browser
data/
  alarm-codes.ts    # Code database + search/match utilities
```
