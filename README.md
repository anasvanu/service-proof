# Service Proof (Serverless Firebase)

Service Proof is a complete vehicle service transparency ecosystem (inspired by Xtime). It includes a **Multi-Point Inspection (MPI)** engine, advisor-customer chat channels, digital signature approvals, and visual **Proof-of-Work Verification** (video streams of fluid drainages, tire wall tread depths, brake pads, etc.) to bridge the trust gap between workshops and vehicle owners.

By utilizing a **Serverless Database Architecture** with **Firebase Firestore**, this repository requires no backend API server, eliminating startup latencies ("cold starts") and syncing changes in real-time across Web and Mobile dashboards automatically.

---

## Monorepo Architecture

The repository is structured as a serverless monorepo:

- **`web/`**: Vite + React modern glassmorphic web dashboard containing 4 dedicated roles (Manager, Advisor, Technician, and Customer) communicating directly with Firestore.
- **`mobile/`**: Expo + React Native mobile application for customers to track service in real time, view proofs, accept/decline repairs, and review their digital vehicle service history passport.

---

## Setup & Environment Variables

To connect your applications to the cloud, you will need to set up a free Firebase project.

### 1. Create a Free Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Name your project (e.g. `service-proof`) and click **Create Project**.
3. Under **Build**, select **Firestore Database** and click **Create Database**. Start in **production mode** or **test mode** (for test mode, rules allow public reads/writes for 30 days; make sure to write secure security rules for production). Select your database region and click **Enable**.
4. In the Project Overview dashboard, click the **Web Icon (`</>`)** to register a new Web App. Copy the `firebaseConfig` object values. It will look like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "service-proof.firebaseapp.com",
     projectId: "service-proof",
     storageBucket: "service-proof.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:12345:web:abcd"
   };
   ```

### 2. Configure Web Dashboard Environment Variables
Create a `.env` file inside the `web/` folder:
```env
VITE_FIREBASE_API_KEY=your_apiKey
VITE_FIREBASE_AUTH_DOMAIN=your_authDomain
VITE_FIREBASE_PROJECT_ID=your_projectId
VITE_FIREBASE_STORAGE_BUCKET=your_storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messagingSenderId
VITE_FIREBASE_APP_ID=your_appId
```

### 3. Configure Mobile App Environment Variables
Create a `.env` file inside the `mobile/` folder. Expo uses `EXPO_PUBLIC_` prefix to securely expose keys to your client bundle:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_apiKey
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_authDomain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_projectId
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storageBucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messagingSenderId
EXPO_PUBLIC_FIREBASE_APP_ID=your_appId
```

---

## Running Locally

### 1. Run the Web Dashboard
```bash
cd web
npm install
npm run dev
```
*The web dashboard runs locally on port `5173`.*

### 2. Run the Customer Mobile App
```bash
cd mobile
npm install
npm run start
# Or for web preview output:
npm run web
```
*You can scan the terminal QR code using the free **Expo Go** app on your physical iOS/Android phone to run the mobile app instantly.*

---

## Deployment & Hosting

### Web Dashboard (Vercel - 100% Free)
1. Import this repository into [Vercel](https://vercel.com).
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `web`
3. Under **Environment Variables**, add the six `VITE_FIREBASE_` variables config keys.
4. Click **Deploy**.

### Mobile App Testing & Distribution
- **Expo Go (Free):** Use `npx expo start` to run and share the project dynamically for testing on iOS and Android.
- **Android Release APK (Free):** Build a standalone `.apk` using Expo's cloud compiler (EAS Build):
  ```bash
  npm install -g eas-cli
  eas login
  eas build:configure
  eas build --platform android --profile preview
  ```
  *(Once completed, Expo provides a public download link to install the `.apk` directly on any Android device for free.)*
