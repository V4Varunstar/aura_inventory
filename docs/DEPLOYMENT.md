
# Deployment Instructions

Follow these steps to deploy the Aura Inventory Management System to Firebase.

---

### Prerequisites

-   A Google Account.
-   [Node.js and npm](https://nodejs.org/en/) installed.
-   [Firebase CLI](https://firebase.google.com/docs/cli) installed (`npm install -g firebase-tools`).

---

### Step 1: Create Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and give your project a name (e.g., "aura-inventory-system").
3.  Follow the on-screen instructions to create the project. Google Analytics is optional.

---

### Step 2: Enable Firebase Services

In the Firebase Console, navigate to your new project:

1.  **Authentication**:
    -   Go to **Build > Authentication**.
    -   Click **"Get started"**.
    -   Under the **Sign-in method** tab, enable **Email/Password**.

2.  **Firestore Database**:
    -   Go to **Build > Firestore Database**.
    -   Click **"Create database"**.
    -   Start in **production mode**. This is important for security.
    -   Choose a Cloud Firestore location (e.g., `asia-south1` for India).
    -   Click **"Enable"**.

3.  **Storage**:
    -   Go to **Build > Storage**.
    -   Click **"Get started"**.
    -   Follow the prompts, using the default security rules for now. You will secure them later.

---

### Step 3: Set Up Your Local Project

1.  Clone or download the project repository.
2.  Navigate into the project directory in your terminal.
3.  Log in to Firebase: `firebase login`.
4.  Initialize Firebase in your project: `firebase init`.
    -   Select **Firestore**, **Functions**, **Hosting**, and **Storage**.
    -   Choose **"Use an existing project"** and select the project you created.
    -   **Firestore**: Use the default rules file (`firestore.rules`).
    -   **Functions**: Choose **TypeScript**. Say yes to install dependencies.
    -   **Hosting**:
        -   What do you want to use as your public directory? `dist` (or `build` depending on your build tool).
        -   Configure as a single-page app (rewrite all urls to /index.html)? **Yes**.
        -   Set up automatic builds and deploys with GitHub? **No** (for now).
    -   **Storage**: Use the default rules file (`storage.rules`).

---

### Step 4: Configure Environment Variables

1.  In your Firebase project, go to **Project Settings** (gear icon) > **General**.
2.  Scroll down to "Your apps" and click the web icon (`</>`).
3.  Give the app a nickname and click **"Register app"**.
4.  You will be given a `firebaseConfig` object. Copy these keys.
5.  In your React project's root, create a file named `.env`.
6.  Add the config variables to the `.env` file, prefixed with `VITE_` (if using Vite) or `REACT_APP_` (if using Create React App).
    ```
    VITE_FIREBASE_API_KEY="AIza..."
    VITE_FIREBASE_AUTH_DOMAIN="..."
    VITE_FIREBASE_PROJECT_ID="..."
    VITE_FIREBASE_STORAGE_BUCKET="..."
    VITE_FIREBASE_MESSAGING_SENDER_ID="..."
    VITE_FIREBASE_APP_ID="..."
    ```

---

### Step 5: Implement Backend Logic

1.  Open the `functions` directory created by the Firebase CLI.
2.  Inside `functions/src/index.ts`, write the TypeScript code for the Cloud Functions described in `CLOUD_FUNCTIONS.md`.
3.  You will need to install the `firebase-admin` and `firebase-functions` SDKs.

---

### Step 6: Deploy Everything

1.  **Deploy Firestore Rules**:
    -   Open `firestore.rules`. Add security rules to protect your data. Start with a basic rule that only allows authenticated users to read/write.
    -   Deploy with: `firebase deploy --only firestore`

2.  **Deploy Cloud Functions**:
    -   Navigate to the `functions` directory: `cd functions`
    -   Install dependencies: `npm install`
    -   Build the TypeScript code: `npm run build`
    -   Go back to the root: `cd ..`
    -   Deploy with: `firebase deploy --only functions`

3.  **Build and Deploy Frontend**:
    -   In your React project root, run the build command: `npm run build`.
    -   Deploy the built app to Firebase Hosting: `firebase deploy --only hosting`.

---

### Step 7: First Admin Setup

1.  Go to the **Authentication** page in your Firebase Console.
2.  Click **"Add user"** and manually create your first admin user with your email and a temporary password.
3.  Go to the **Firestore Database** page.
4.  Manually create the `users` collection.
5.  Create a new document. The Document ID **must** be the User UID from the user you just created in Auth.
6.  Add the fields:
    -   `name`: `string` (Your Name)
    -   `email`: `string` (Your Email)
    -   `role`: `string` (Set this to "Admin")
    -   `isEnabled`: `boolean` (Set to `true`)
    -   `createdAt`: `timestamp` (Current time)
7.  You can now log into your deployed application with these credentials and start adding other users through the UI.
