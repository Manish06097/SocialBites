//
// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  projectId: "surat-social-bites",
  appId: "1:242915397520:web:5c86b9ef52bede69362d15",
  storageBucket: "surat-social-bites.firebasestorage.app",
  apiKey: "AIzaSyDJJJgSfKlWmWDKj2WvGh6fBVTfeD9CcW8",
  authDomain: "surat-social-bites.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "242915397520",
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);

export { app, auth };
