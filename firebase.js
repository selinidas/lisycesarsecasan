/* ============================================================
   CESAR & LISSETTE — firebase.js
   Inicialización de Firebase + exports para script.js
   ============================================================

   ── Cómo ver los RSVPs recibidos ────────────────────────────
   Firebase Console → Firestore Database → colección "rsvps"
   Cada documento = un invitado que confirmó

   ── Cómo ver el contador ────────────────────────────────────
   Firebase Console → Realtime Database → confirmedCount

   ── Reglas de seguridad (actualizar antes de 30 días) ───────
   Ve a Firebase Console y actualiza las reglas de Firestore:

   Firestore → Rules:
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /rsvps/{id} {
         allow create: if
           request.resource.data.nombre is string &&
           request.resource.data.email  is string &&
           request.resource.data.asistencia in ['si', 'no'];
         allow read: if true;
         allow update, delete: if false;
       }
       match /invitados/{id} {
         allow read, write: if true;
       }
       match /gastos/{id} {
         allow read, write: if true;
       }
       match /ingresos/{id} {
         allow read, write: if true;
       }
       match /inspo/{id} {
         allow read, write: if true;
       }
     }
   }

   Realtime Database → Rules:
   {
     "rules": {
       "confirmedCount": {
         ".read":  true,
         ".write": true
       }
     }
   }

   ── Firebase Storage Rules (para fotos del tablero inspo) ───
   Storage → Rules:
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /inspo/{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ============================================================ */

import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

import {
  getDatabase,
  ref,
  onValue,
  increment,
  update,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js';


/* ── Configuración del proyecto ───────────────────────────── */
const firebaseConfig = {
  apiKey:            'AIzaSyATR-1uUqpJFZAG9OPOjxYas7DjvEEVRCo',
  authDomain:        'boda-cesar-lissette.firebaseapp.com',
  /*
    databaseURL: Ve a Firebase Console → Realtime Database
    y copia la URL que aparece arriba del árbol de datos.
    Formato: https://TU-PROYECTO-default-rtdb.firebaseio.com
  */
  databaseURL:       'https://boda-cesar-lissette-default-rtdb.firebaseio.com',
  projectId:         'boda-cesar-lissette',
  storageBucket:     'boda-cesar-lissette.firebasestorage.app',
  messagingSenderId: '1080316555242',
  appId:             '1:1080316555242:web:48614150034617521ecc93',
};


/* ── Inicializar ──────────────────────────────────────────── */
const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const rtdb = getDatabase(app);


/* ── Exports ──────────────────────────────────────────────── */
export {
  db, rtdb,
  collection, addDoc, serverTimestamp,
  ref, onValue, increment, update,
};
