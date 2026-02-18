# Cesar & Lissette — Wedding v1.0
### 17 · Abril · 2027 · La Vega, República Dominicana

Sitio web de invitación de boda. Vanilla HTML + CSS + JS. Sin frameworks. Listo para GitHub Pages.

---

## Estructura de archivos

```
boda-cesar-lissette/
├── index.html   ← Estructura y contenido
├── style.css    ← Todos los estilos
├── script.js    ← Lógica (countdown, RSVP, galería)
├── README.md    ← Este archivo
└── fotos/       ← Crea esta carpeta para tus imágenes
    ├── foto1.jpg
    ├── foto2.jpg
    └── ...
```

---

## Personalización rápida

### Cambiar el lugar exacto en el mapa
En `index.html`, busca el `<iframe>` de Google Maps y cambia la query:
```html
<!-- Cambia "La+Vega" por la dirección exacta del salón -->
src="https://maps.google.com/maps?q=Salon+Los+Jardines,+La+Vega,+Dominican+Republic&output=embed"
```

### Agregar tu playlist de Spotify
1. Abre Spotify → tu playlist → `···` → **Compartir** → **Copiar enlace**
2. El enlace es: `https://open.spotify.com/playlist/XXXXXXXXXXXXXXXX`
3. Copia el ID (`XXXXXXXXXXXXXXXX`)
4. En `index.html`, reemplaza `PLAYLIST_ID` en el `<iframe>` de Spotify:
```html
src="https://open.spotify.com/embed/playlist/XXXXXXXXXXXXXXXX?utm_source=generator&theme=0"
```

### Agregar fotos reales a la galería
En `index.html`, dentro de cada `.galeria__item`, reemplaza el `<div class="galeria__photo">` por:
```html
<img src="fotos/tu-foto.jpg" alt="Cesar y Lissette en la playa" loading="lazy" />
```

---

## Deploy en GitHub Pages

### Paso 1 — Crear el repositorio
```bash
# Inicia git en la carpeta del proyecto
git init
git add .
git commit -m "Wedding v1.0 — initial commit"
```

### Paso 2 — Subir a GitHub
```bash
# Crea un repo en github.com llamado: lissycesarsecasan
# Luego conecta y sube:
git remote add origin https://github.com/TU_USUARIO/lissycesarsecasan.git
git branch -M main
git push -u origin main
```

### Paso 3 — Activar GitHub Pages
1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages** (menú lateral izquierdo)
3. En **Source**, selecciona: `Deploy from a branch`
4. Branch: `main` / Folder: `/ (root)`
5. Haz clic en **Save**
6. En 2-3 minutos tu sitio estará en:
   `https://TU_USUARIO.github.io/lissycesarsecasan/`

---

## Conectar dominio propio (www.lissycesarsecasan.com)

### Paso 1 — Archivo CNAME
Crea un archivo llamado `CNAME` (sin extensión) en la raíz del proyecto con solo esta línea:
```
www.lissycesarsecasan.com
```
Haz commit y push de ese archivo.

### Paso 2 — Configurar DNS en tu proveedor de dominio
En el panel de tu registrador (GoDaddy, Namecheap, Cloudflare, etc.), agrega estos registros:

**Para el subdominio `www`:**
| Tipo  | Host | Valor                       |
|-------|------|-----------------------------|
| CNAME | www  | TU_USUARIO.github.io        |

**Para el dominio raíz (`lissycesarsecasan.com` sin www):**
| Tipo | Host | Valor          |
|------|------|----------------|
| A    | @    | 185.199.108.153 |
| A    | @    | 185.199.109.153 |
| A    | @    | 185.199.110.153 |
| A    | @    | 185.199.111.153 |

### Paso 3 — Activar HTTPS
1. En GitHub → Settings → Pages
2. Ingresa tu dominio en **Custom domain**: `www.lissycesarsecasan.com`
3. Activa **Enforce HTTPS** ✓
4. Espera 15-30 minutos para que el certificado SSL se emita.

---

## Firebase — Producción real (opcional)

Si quieres que el RSVP se guarde en la nube y el contador sea en tiempo real:

### Crear proyecto Firebase
1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un proyecto: `boda-cesar-lissette`
3. Activa estas funciones:
   - **Firestore Database** → para guardar RSVPs
   - **Realtime Database** → para el contador en tiempo real
   - **Storage** → para fotos de invitados (opcional)

### Obtener credenciales
1. Firebase Console → Configuración del proyecto ⚙️
2. **Tus apps** → Agrega app web `</>`
3. Copia el objeto `firebaseConfig`

### Conectar al sitio
Agrega el CDN antes de `script.js` en `index.html`:
```html
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
  import { getFirestore }  from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

  const firebaseConfig = {
    apiKey:            "TU_API_KEY",
    authDomain:        "tu-proyecto.firebaseapp.com",
    projectId:         "tu-proyecto",
    storageBucket:     "tu-proyecto.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId:             "APP_ID"
  };

  window.__firebaseApp = initializeApp(firebaseConfig);
  window.__db          = getFirestore(window.__firebaseApp);
</script>
```

Luego en `script.js`, sigue las instrucciones detalladas en los comentarios de cada función:
- `initRSVP()` → Firestore para guardar respuestas
- `initConfirmedCounter()` → Realtime Database para contador en vivo
- `initGallery()` → Storage para fotos de invitados

---

## Checklist antes del lanzamiento

- [ ] Reemplazar `PLAYLIST_ID` con el ID real de tu playlist de Spotify
- [ ] Actualizar el `<iframe>` del mapa con la dirección exacta del salón
- [ ] Agregar fotos reales en la carpeta `fotos/`
- [ ] Reemplazar las imágenes placeholder en la galería
- [ ] Configurar dominio personalizado
- [ ] Probar el formulario RSVP
- [ ] Probar en móvil (iOS + Android)
- [ ] Probar en modo oscuro del sistema
- [ ] Compartir el enlace con los novios para aprobación final 🥂

---

*Wedding v1.0 — Cesar & Lissette · 17.04.2027*
