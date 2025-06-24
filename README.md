# BHAV APP

![Angry Metal Gif](https://media.giphy.com/media/l1J9u3TZfpmeDLkD6/giphy.gif)

## LISTEN UP! THIS IS HOW YOU RUN THIS DAMN APP!

**DO NOT** even *think* about running this app without following these instructions **EXACTLY**. Dependencies are a NIGHTMARE and will break if you look at them wrong!

## Prerequisites

- Node.js (v16+ or ELSE!)
- npm or yarn (pick ONE and STICK WITH IT!)
- Expo CLI (install it GLOBALLY or face the consequences!)
- A working brain (if you don't have one, STOP NOW!)

## Installation Steps

1. **CLONE THE REPOSITORY**
   ```bash
   git clone <repository-url>
   cd Bhav-App
   ```

2. **INSTALL THE DEPENDENCIES OR DIE TRYING**
   ```bash
   npm install
   # OR
   yarn install
   ```

3. **FIX THE INEVITABLE DEPENDENCY HELL WITH EXPO-DOCTOR**
   ```bash
   npx expo-doctor
   ```
   
   **WHEN** (not if) you see dependency conflicts:
   ```bash
   npx expo-doctor --fix-dependencies
   ```
   
   **STILL BROKEN?** Try this:
   ```bash
   npx expo install --fix
   ```

4. **START THE APP AND PRAY IT WORKS**
   ```bash
   npx expo start
   ```

## Common Issues and How to FIX THEM YOURSELF

### "It doesn't work!" 
OBVIOUSLY! Try these fixes:

1. **Clear cache and reinstall EVERYTHING**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **Expo is being STUPID again**
   ```bash
   npx expo-doctor --fix-dependencies
   npx expo start -c
   ```

3. **Metro bundler is BROKEN**
   ```bash
   npx react-native start --reset-cache
   ```

### Dependencies Compatibility

**DO NOT** update packages without checking compatibility! This app uses specific versions for a REASON!

Run this to check what's broken:
```bash
npx expo-doctor
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in YOUR OWN values (DON'T ASK ME what they should be!)
3. RESTART the app after ANY changes to environment variables!

## Running on Physical Device

1. Install Expo Go on your device
2. Scan the QR code from terminal
3. If it doesn't work, CHECK YOUR NETWORK! You need to be on the SAME WIFI!

## Building for Production

```bash
npx expo build:android
# OR
npx expo build:ios
```

## CONTACT

If something is STILL broken (and it probably is), contact:
- Email: omshrikhande73@gmail.com

## License

This project is licensed under terms that say DON'T MESS IT UP!

![Angry Coding Gif](https://media.giphy.com/media/yYSSBtDgbbRzq/giphy.gif)