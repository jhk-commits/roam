# Roam — Family Activity Discovery App

Roam helps parents find things to do with their kids nearby. It shows a map of Greenwich, CT with nearby events, attractions, museums, parks, and indoor play spaces — all filterable by age, category, and timing.

This is a prototype built with **React Native** and **Expo**. You can run it on your iPhone using the free **Expo Go** app — no Mac required.

---

## Getting the App Running on Your Phone

Follow these steps in order. Each step builds on the previous one.

### Step 1: Install Node.js

Node.js is the tool that runs the app on your computer. You need it installed first.

1. Go to **https://nodejs.org**
2. Click the big green button that says **"LTS"** (Long Term Support) — this downloads the installer
3. Open the downloaded file and follow the installer prompts. Click "Next" through each screen and accept the defaults
4. When it finishes, you're done — Node.js is installed

**How to check it worked:** Open Command Prompt (see Step 2) and type `node --version` and press Enter. You should see a version number like `v20.x.x`.

### Step 2: Open a Terminal (Command Prompt or PowerShell)

You'll type commands into a terminal to set up and run the app.

- Press the **Windows key** on your keyboard
- Type **"Command Prompt"** or **"PowerShell"**
- Click the app that appears to open it

You should see a black (or blue) window with a blinking cursor. That's your terminal.

### Step 3: Install Git (if you don't have it)

Git is a tool that lets you download code from GitHub.

1. Go to **https://git-scm.com/downloads/win**
2. Download the installer and run it
3. Click "Next" through all the prompts — the defaults are fine
4. When it finishes, close and reopen your terminal (so it recognizes the new tool)

**How to check it worked:** Type `git --version` in your terminal and press Enter. You should see a version number.

### Step 4: Clone the Repository

This downloads the app's code to your computer.

In your terminal, type this command and press Enter:

```
git clone https://github.com/anthropics/roam.git
```

This creates a folder called `roam` on your computer with all the code inside.

### Step 5: Navigate into the Project Folder

Type this command and press Enter:

```
cd roam
```

Your terminal prompt should now show that you're inside the `roam` folder.

### Step 6: Install Dependencies

This downloads all the extra libraries the app needs. Type this and press Enter:

```
npm install
```

This may take a minute or two. You'll see a progress bar and some output. Wait until it finishes and you see your cursor blinking again.

If you see some "warnings" in yellow text, that's normal — don't worry about them.

### Step 7: Start the App

Type this command and press Enter:

```
npx expo start
```

After a few seconds, you'll see:
- A large **QR code** in your terminal
- A message saying the development server is running
- Some menu options (like pressing `i` for iOS)

**Leave this terminal window open** — it's running the server that sends the app to your phone.

### Step 8: Get Expo Go on Your iPhone

1. Open the **App Store** on your iPhone
2. Search for **"Expo Go"**
3. Download and install it (it's free)

### Step 9: Scan the QR Code

1. Make sure your **iPhone** and your **Windows PC** are on the **same WiFi network**
2. Open the **Camera app** on your iPhone
3. Point it at the **QR code** shown in your terminal
4. Tap the notification that appears — it will say something like "Open in Expo Go"
5. The app will load on your phone. The first time may take 30–60 seconds.

You should see the Roam welcome screen!

### Step 10: Stopping and Restarting

**To stop the server:** Go to the terminal window and press `Ctrl + C`.

**To restart:** Make sure you're in the `roam` folder, then type `npx expo start` again.

---

## Troubleshooting

### "The QR code doesn't work" or "Network error"

Your phone and computer might be on different networks, or your firewall might be blocking the connection. Try this instead:

```
npx expo start --tunnel
```

This routes the connection through the internet instead of your local network. It's a bit slower but more reliable. (You may be prompted to install `@expo/ngrok` — type `y` and press Enter if asked.)

### "The app is stuck loading"

- Try shaking your phone to open the Expo developer menu, then tap "Reload"
- Or stop the server (`Ctrl + C`) and start it again (`npx expo start`)

### "npm install failed"

- Make sure you're inside the `roam` folder (your terminal prompt should show `roam`)
- Try deleting the `node_modules` folder and running `npm install` again:
  ```
  rmdir /s /q node_modules
  npm install
  ```

### "expo: command not found"

- Make sure Node.js is installed (Step 1)
- Close your terminal and reopen it, then try again

### "Something about a 'native module' or 'prebuild'"

This shouldn't happen with this project, but if it does, make sure you're using **Expo Go** (not a custom dev client). All dependencies in this project are Expo Go compatible.

---

## Project Structure

```
roam/
├── App.js                          # Entry point
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js         # Tab bar + stack navigators
│   ├── screens/
│   │   ├── OnboardingScreen.js     # First-launch welcome flow
│   │   ├── ExploreScreen.js        # Map + filters + activity list
│   │   ├── ActivityDetailScreen.js # Full detail view
│   │   ├── SavedScreen.js          # Bookmarked activities
│   │   └── ProfileScreen.js        # Kid profiles + settings
│   ├── components/
│   │   ├── ActivityCard.js         # Reusable activity card
│   │   ├── FilterBar.js            # Horizontal filter chips
│   │   ├── FilterChip.js           # Individual filter chip
│   │   ├── CategoryBadge.js        # Colored category tag
│   │   ├── AgeMatchBanner.js       # Age-match indicator
│   │   ├── MapMarker.js            # Custom map pin
│   │   └── EmptyState.js           # Empty state component
│   ├── data/
│   │   └── mockData.js             # 25 mock activities
│   ├── context/
│   │   ├── BookmarkContext.js      # Bookmark state + persistence
│   │   └── ProfileContext.js       # Kid profiles + preferences
│   ├── utils/
│   │   ├── distance.js             # Haversine distance formula
│   │   ├── filters.js              # Activity filter logic
│   │   └── constants.js            # Colors, categories, keys
│   └── theme/
│       └── colors.js               # Color palette
├── package.json
├── app.json                        # Expo configuration
└── babel.config.js
```

---

## Tech Stack

- **React Native** with **Expo** (managed workflow)
- **React Navigation** for screen navigation and tab bar
- **react-native-maps** for the map view
- **@gorhom/bottom-sheet** for the draggable activity list
- **AsyncStorage** for persisting bookmarks and profiles
- **Expo Location** for location permissions
- Plain **JavaScript** (no TypeScript)

All packages are compatible with **Expo Go** — no native builds required.
