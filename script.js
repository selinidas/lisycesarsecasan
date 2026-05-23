/* ============================================================
   CESAR & LISSETTE — script.js
   Wedding v1.0 | Firebase + LocalStorage
   ============================================================ */

import {
  db, rtdb,
  collection, addDoc, serverTimestamp,
  ref, onValue, increment, update,
} from './firebase.js';


/* ============================================================
   EMAILJS — Envío automático del folleto de confirmación
   ─────────────────────────────────────────────────────────────
   Rellena estos tres valores después de configurar EmailJS.
   Ver README.md → sección "Configurar EmailJS".
   ============================================================ */
const EMAILJS_PUBLIC_KEY     = 'SAAmLPQB_I9_7kltt';   /* ← de EmailJS → Account → API Keys */
const EMAILJS_SERVICE_ID     = 'service_hlonfmp';     /* ← de EmailJS → Email Services */
const EMAILJS_TEMPLATE_ID    = 'template_zgdpo41';    /* ← plantilla España / otros países */
const EMAILJS_TEMPLATE_ID_RD = 'template_i6uw91d';    /* ← plantilla República Dominicana */

/* ── Helpers ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ============================================================
   CONFIGURACIÓN DEL ÁLBUM COMPARTIDO
   ─────────────────────────────────────────────────────────────
   Cambia ALBUM_URL por el enlace de tu álbum compartido.

   ── Google Fotos ────────────────────────────────────────────
   1. Abre Google Fotos → Álbumes → "+" Nuevo álbum
   2. Menú del álbum (⋮) → "Compartir álbum"
   3. Activa "Colaboración" para que los invitados puedan añadir fotos
   4. Activa "Compartir enlace"
   5. Copia el enlace y pégalo abajo

   ── iCloud (iPhone / Mac) ────────────────────────────────────
   1. Fotos → Álbumes → "+" Álbum compartido nuevo
   2. Activa "Sitio web público"
   3. Copia el enlace de la notificación

   ── Dropbox ─────────────────────────────────────────────────
   1. Crea una carpeta compartida
   2. Compartir → Crear enlace compartido → Copiar enlace
   ──────────────────────────────────────────────────────────── */
const ALBUM_URL = 'https://photos.google.com/REEMPLAZA_ESTE_ENLACE';


/* ============================================================
   1. NAVEGACIÓN
   ============================================================ */
function initNav() {
  const nav      = $('#nav');
  const toggle   = $('#nav-toggle');
  const mobile   = $('#nav-mobile');
  const closeBtn = $('#nav-mobile-close');

  if (!nav || !toggle || !mobile) return;

  /* Clase scrolled */
  const handleScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* Abrir / cerrar menú móvil */
  function openMenu() {
    mobile.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeMenu() {
    mobile.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    toggle.focus();
  }

  toggle.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  /* Cerrar al hacer clic en un enlace */
  $$('a', mobile).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Cerrar con Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobile.classList.contains('open')) closeMenu();
  });
}


/* ============================================================
   2. HERO — animación de entrada
   ============================================================ */
function initHero() {
  const content = document.querySelector('.hero__content');
  if (!content) return;

  /* Activar después de que el DOM haya pintado */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      content.style.transition = 'opacity 1.1s cubic-bezier(0.4,0,0.2,1), transform 1.1s cubic-bezier(0.4,0,0.2,1)';
      content.style.opacity    = '1';
      content.style.transform  = 'translateY(0)';
    });
  });
}


/* ============================================================
   3. SCROLL REVEAL (Intersection Observer)
   ============================================================ */
function initScrollReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        /* Delay escalonado basado en posición entre hermanos */
        const siblings = $$('.reveal', entry.target.parentElement);
        const idx      = siblings.indexOf(entry.target);
        const delay    = Math.min(idx * 90, 360); /* máx 360 ms */

        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}


/* ============================================================
   4. COUNTDOWN TIMER
   Objetivo: 13 marzo 2027, 17:00 hora RD (UTC-4, sin DST)
   ============================================================ */
function initCountdown() {
  const TARGET = new Date('2027-03-13T17:00:00-04:00');

  const daysEl    = $('#cd-days');
  const hoursEl   = $('#cd-hours');
  const minutesEl = $('#cd-minutes');
  const secondsEl = $('#cd-seconds');

  if (!daysEl) return;

  function pad(n, len = 2) {
    return String(n).padStart(len, '0');
  }

  function tick() {
    const now  = Date.now();
    const diff = TARGET - now;

    if (diff <= 0) {
      daysEl.textContent    = '000';
      hoursEl.textContent   = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      showWeddingDay();
      return;
    }

    const days    = Math.floor(diff / 864e5);
    const hours   = Math.floor((diff % 864e5) / 36e5);
    const minutes = Math.floor((diff % 36e5) / 6e4);
    const seconds = Math.floor((diff % 6e4) / 1e3);

    daysEl.textContent    = pad(days, 3);
    hoursEl.textContent   = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  function showWeddingDay() {
    const section = document.querySelector('.countdown');
    if (!section || section.dataset.celebrated) return;
    section.dataset.celebrated = '1';

    const msg = document.createElement('p');
    msg.style.cssText = `
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(1.2rem, 3vw, 1.6rem);
      font-style: italic;
      color: var(--rust);
      text-align: center;
      margin-top: 2.5rem;
      animation: slideUp 0.6s ease both;
    `;
    msg.textContent = '¡Hoy es el gran día! ✨';
    document.querySelector('.countdown__timer')?.after(msg);
  }

  tick();
  setInterval(tick, 1000);
}


/* ============================================================
   5. RSVP FORM — LocalStorage

   ── Migración a Firebase Firestore ────────────────────────
   Para guardar las respuestas en la nube:

   PASO 1: Instala el SDK (si usas bundler) o agrega el CDN:
     <script type="module">
       import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js';
       import { getFirestore, collection, addDoc, serverTimestamp }
         from 'https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js';

   PASO 2: Inicializa con tu config (Firebase Console → Configuración):
     const firebaseConfig = {
       apiKey:            "TU_API_KEY",
       authDomain:        "tu-proyecto.firebaseapp.com",
       projectId:         "tu-proyecto",
       storageBucket:     "tu-proyecto.appspot.com",
       messagingSenderId: "SENDER_ID",
       appId:             "APP_ID"
     };
     const app = initializeApp(firebaseConfig);
     const db  = getFirestore(app);

   PASO 3: En handleSubmit(), reemplaza saveLocally(data) por:
     await addDoc(collection(db, 'rsvps'), {
       ...data,
       timestamp: serverTimestamp()
     });

   PASO 4: Reglas de seguridad en Firestore:
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /rsvps/{id} {
           allow create: if
             request.resource.data.nombre is string &&
             request.resource.data.email  is string;
           allow read, update, delete: if false;
         }
       }
     }
   ──────────────────────────────────────────────────────────
   ============================================================ */
function initRSVP() {
  const form       = $('#rsvp-form');
  const successEl  = $('#rsvp-success');
  const submitBtn  = $('#rsvp-submit');

  if (!form) return;

  form.addEventListener('submit', handleSubmit);

  async function handleSubmit(e) {
    e.preventDefault();

    /* Validar */
    if (!validateForm(form)) return;

    /* Recoger datos */
    const checkedRadio = $('input[name="asistencia"]:checked', form);
    const acompNombre  = $('#acompanante-nombre', form)?.value.trim() || '';

    const data = {
      nombre:           $('#nombre', form).value.trim(),
      email:            $('#email', form).value.trim(),
      asistencia:       checkedRadio?.value || '',
      paisOrigen:       $('#pais-origen', form)?.value || '',
      acompanante:      acompNombre,
      ninos:            $('input[name="ninos"]:checked', form)?.value || 'no',
      restricciones:    $('#restricciones', form)?.value.trim() || '',
      mensaje:          $('#mensaje', form).value.trim(),
      timestamp:        new Date().toISOString(),
    };

    /* Estado de carga */
    submitBtn.disabled = true;
    $('.btn__text', submitBtn).hidden = true;
    $('.btn__loading', submitBtn).hidden = false;

    /* Guardar en Firebase + LocalStorage */
    await saveRSVP(data);

    /* Actualizar contador si asiste (la persona + sus acompañantes) */
    if (data.asistencia === 'si') {
      await incrementConfirmed(1 + (data.acompanante ? 1 : 0));
    }

    /* Enviar correo de confirmación si asiste */
    if (data.asistencia === 'si') {
      await sendConfirmationEmail(data.nombre, data.email, data.paisOrigen);
    }

    /* Mostrar mensaje de éxito */
    showSuccess(form, successEl, data.asistencia === 'no');
  }
}

async function saveRSVP(data) {
  /* 1. Firestore — fuente principal */
  try {
    await addDoc(collection(db, 'rsvps'), {
      ...data,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore no disponible, guardando solo en localStorage:', err);
  }

  /* 2. LocalStorage — respaldo offline */
  const list = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
  list.push(data);
  localStorage.setItem('wedding_rsvps', JSON.stringify(list));
}

async function sendConfirmationEmail(nombre, email, paisOrigen) {
  const templateId = paisOrigen === 'rd' ? EMAILJS_TEMPLATE_ID_RD : EMAILJS_TEMPLATE_ID;

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      { to_name: nombre, to_email: email },
      { publicKey: EMAILJS_PUBLIC_KEY }   /* formato correcto v4 */
    );
    console.log('Correo de confirmación enviado a', email);
  } catch (err) {
    /* El correo es opcional — no bloqueamos el flujo si falla */
    console.warn('No se pudo enviar el correo de confirmación:', err);
  }
}

function showSuccess(form, successEl, declined = false) {
  form.reset();
  form.hidden = true;
  if (!successEl) return;

  const msgEl = $('#rsvp-success-msg');
  if (msgEl) {
    msgEl.textContent = declined
      ? 'Lamentamos que no puedas asistir. ¡Te tendremos en mente!'
      : '¡Tu respuesta ha sido registrada! Nos vemos el 13 de Marzo 🎉';
  }
  successEl.hidden = false;
}

/* Validación del formulario */
function validateForm(form) {
  clearErrors(form);
  let valid = true;

  const nombre  = $('#nombre', form);
  const email   = $('#email', form);
  const asistencia = $('input[name="asistencia"]:checked', form);

  if (!nombre.value.trim()) {
    markError(nombre, 'Por favor ingresa tu nombre');
    valid = false;
  }

  if (!email.value.trim() || !isEmail(email.value)) {
    markError(email, 'Por favor ingresa un correo electrónico válido');
    valid = false;
  }

  if (!asistencia) {
    const group = $('.form__radio-group', form);
    if (group) {
      const err = createError('Por favor selecciona si asistirás');
      group.after(err);
    }
    valid = false;
  }

  /* Scroll al primer error */
  if (!valid) {
    const firstErr = $('.error, .form__error-msg', form);
    firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return valid;
}

function markError(input, message) {
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');
  const err = createError(message);
  input.after(err);
}

function createError(message) {
  const span = document.createElement('span');
  span.className = 'form__error-msg';
  span.setAttribute('role', 'alert');
  span.textContent = message;
  return span;
}

function clearErrors(form) {
  $$('.error', form).forEach(el => {
    el.classList.remove('error');
    el.removeAttribute('aria-invalid');
  });
  $$('.form__error-msg', form).forEach(el => el.remove());
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}


/* ============================================================
   6. CONTADOR DE CONFIRMADOS

   ── Migración a Firebase Realtime Database ────────────────
   Para un contador en tiempo real visible por TODOS los usuarios:

   PASO 1: Activa Realtime Database en tu proyecto Firebase.

   PASO 2: Importa el SDK:
     import { getDatabase, ref, onValue, increment, update }
       from 'https://www.gstatic.com/firebasejs/10.x.x/firebase-database.js';

   PASO 3: Conecta y escucha el contador:
     const db = getDatabase(app);
     const counterRef = ref(db, 'confirmedCount');

     // Actualización en tiempo real para todos los visitantes:
     onValue(counterRef, snapshot => {
       const count = snapshot.val() || 0;
       animateNumber($('#confirmed-count'), 0, count, 1400);
     });

   PASO 4: Al confirmar RSVP, incrementa en el servidor:
     await update(ref(db, '/'), {
       confirmedCount: increment(attendingTotal)
     });

   PASO 5: Para mayor seguridad, usa una Cloud Function de Firebase
     que valide los datos antes de escribir al contador.

   PASO 6: Reglas de Realtime Database:
     {
       "rules": {
         "confirmedCount": {
           ".read":  true,
           ".write": false  // Solo Cloud Functions pueden escribir
         }
       }
     }
   ──────────────────────────────────────────────────────────
   ============================================================ */
function initConfirmedCounter() {
  const countEl = $('#confirmed-count');
  if (!countEl) return;

  let animated = false;

  /* Escuchar el contador en tiempo real desde Firebase */
  onValue(ref(rtdb, 'confirmedCount'), (snapshot) => {
    const count = snapshot.val() || 0;

    /* Animar solo la primera vez que entra en viewport */
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return;
        if (!animated) {
          animateNumber(countEl, 0, count, 1600);
          animated = true;
        } else {
          countEl.textContent = count;
        }
        observer.disconnect();
      },
      { threshold: 0.5 }
    );
    observer.observe(countEl);

    /* Si ya es visible, actualizar directamente */
    if (animated) countEl.textContent = count;
  });
}

async function incrementConfirmed(amount) {
  /* Incrementar en Realtime Database (todos los visitantes lo ven) */
  try {
    await update(ref(rtdb), {
      confirmedCount: increment(amount),
    });
  } catch (err) {
    /* Fallback a localStorage si Firebase no está disponible */
    console.warn('RTDB no disponible:', err);
    const current = parseInt(localStorage.getItem('wedding_confirmed') || '0', 10);
    localStorage.setItem('wedding_confirmed', String(current + amount));
    const el = $('#confirmed-count');
    if (el) animateNumber(el, current, current + amount, 1000);
  }
}

/* Animación de número con easing */
function animateNumber(el, from, to, duration) {
  if (from === to) { el.textContent = to; return; }

  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}


/* ============================================================
   7. GALERÍA + LIGHTBOX

   ── Subida de fotos con Firebase Storage ──────────────────
   Para permitir que invitados suban sus fotos:

   PASO 1: Activa Firebase Storage en tu proyecto.

   PASO 2: Importa SDK:
     import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL }
       from 'https://www.gstatic.com/firebasejs/10.x.x/firebase-storage.js';

   PASO 3: Función de subida con progreso:
     async function uploadPhoto(file, guestName) {
       const storage   = getStorage(app);
       const photoRef  = sRef(storage, `guest-photos/${Date.now()}-${file.name}`);
       const upload    = uploadBytesResumable(photoRef, file);

       upload.on('state_changed',
         snapshot => {
           const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
           console.log(`Subiendo... ${pct.toFixed(0)}%`);
         },
         error => console.error('Error al subir:', error),
         async () => {
           const url = await getDownloadURL(upload.snapshot.ref);
           // Guardar URL en Firestore para mostrar en la galería
           await addDoc(collection(db, 'guestPhotos'), {
             url,
             guestName,
             approved:  false,   // Moderación manual antes de publicar
             timestamp: serverTimestamp()
           });
         }
       );
     }

   PASO 4: Reglas de Firebase Storage:
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /guest-photos/{photo} {
           allow read:  if true;
           allow write: if request.resource.size  < 10 * 1024 * 1024
                        && request.resource.contentType.matches('image/.*');
         }
       }
     }

   PASO 5: Renderiza las fotos aprobadas de Firestore en la galería:
     onSnapshot(
       query(collection(db, 'guestPhotos'), where('approved', '==', true)),
       snapshot => {
         snapshot.docs.forEach(doc => renderPhoto(doc.data().url));
       }
     );
   ──────────────────────────────────────────────────────────
   ============================================================ */
function initGallery() {
  const items      = $$('.galeria__item');
  const lightbox   = $('#lightbox');
  const stage      = $('#lightbox-stage');
  const closeBtn   = $('#lightbox-close');
  const prevBtn    = $('#lightbox-prev');
  const nextBtn    = $('#lightbox-next');

  if (!lightbox || !items.length) return;

  /* Recopilar datos de cada foto */
  const photos = items.map(item => {
    const photo = item.querySelector('.galeria__photo');
    const img   = item.querySelector('img');
    return {
      src:   img?.src   || null,
      alt:   img?.alt   || '',
      label: item.querySelector('.galeria__placeholder')?.textContent || '',
      bg:    photo?.className || '',
    };
  });

  let current = 0;

  /* Abrir lightbox */
  function open(idx) {
    current = idx;
    render();
    lightbox.hidden = false;
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  /* Cerrar lightbox */
  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    items[current]?.focus();
  }

  /* Renderizar foto activa */
  function render() {
    const p = photos[current];
    if (p.src) {
      stage.innerHTML = `<img src="${p.src}" alt="${p.alt}" />`;
    } else {
      /* Placeholder mientras no hay fotos reales */
      stage.innerHTML = `
        <div class="lightbox__placeholder ${p.bg}">
          <span>${p.label}</span>
        </div>`;
    }
  }

  function prev() { current = (current - 1 + photos.length) % photos.length; render(); }
  function next() { current = (current + 1) % photos.length; render(); }

  /* Eventos */
  items.forEach((item, idx) => item.addEventListener('click', () => open(idx)));

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  /* Cerrar al hacer clic fuera del stage */
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });

  /* Teclado */
  document.addEventListener('keydown', e => {
    if (lightbox.hidden || lightbox.getAttribute('hidden') !== null) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });

  /* Swipe en móvil */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  }, { passive: true });
}


/* ============================================================
   8. QR CODE — ÁLBUM COMPARTIDO
   ─────────────────────────────────────────────────────────────
   Genera el QR a partir de ALBUM_URL usando la API de qrserver.com,
   que es un servicio gratuito de generación de QR codes.

   El QR se estiliza con los colores de la paleta de la boda:
   — Módulos en color Rust (#9B4A2E)
   — Fondo Off-White (#FAF8F4)

   Para regenerar el QR con tu URL real, solo cambia ALBUM_URL
   al inicio de este archivo.
   ============================================================ */
function initQR() {
  const qrImg   = $('#qr-image');
  const albumBtn = $('#album-link');

  if (!qrImg) return;

  /* Validar que el usuario haya puesto una URL real */
  const isPlaceholder = ALBUM_URL.includes('REEMPLAZA_ESTE_ENLACE');

  if (isPlaceholder) {
    /* Mostrar placeholder visual mientras no hay URL real */
    showQRPlaceholder(qrImg);
  } else {
    /* Generar QR con colores de la paleta */
    const encoded = encodeURIComponent(ALBUM_URL);
    const qrSrc   =
      `https://api.qrserver.com/v1/create-qr-code/` +
      `?size=220x220` +
      `&data=${encoded}` +
      `&color=9B4A2E` +       /* Rust — módulos del QR */
      `&bgcolor=FAF8F4` +      /* Off-white — fondo */
      `&qzone=1` +             /* Zona silenciosa mínima */
      `&format=png` +
      `&ecc=M`;                /* Corrección de errores media */

    qrImg.src = qrSrc;
    qrImg.alt = 'Código QR — Álbum de boda Cesar & Lissette';
  }

  /* Enlace directo al álbum */
  if (albumBtn) {
    albumBtn.href = isPlaceholder ? '#' : ALBUM_URL;
    if (!isPlaceholder) {
      albumBtn.removeAttribute('target');
      albumBtn.setAttribute('target', '_blank');
    }
  }
}

function showQRPlaceholder(imgEl) {
  /* Reemplaza el <img> por un div placeholder que indica al usuario
     que debe actualizar ALBUM_URL en script.js */
  const wrap = imgEl.parentElement;
  if (!wrap) return;

  const placeholder = document.createElement('div');
  placeholder.style.cssText = `
    width: 200px;
    height: 200px;
    border-radius: 8px;
    background-color: var(--mauve-light, #EDE0E8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    text-align: center;
  `;
  placeholder.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2"  y="2"  width="16" height="16" rx="2"
        stroke="#9B4A2E" stroke-width="2" fill="none"/>
      <rect x="6"  y="6"  width="8"  height="8"
        fill="#9B4A2E" opacity="0.5"/>
      <rect x="22" y="2"  width="16" height="16" rx="2"
        stroke="#9B4A2E" stroke-width="2" fill="none"/>
      <rect x="26" y="6"  width="8"  height="8"
        fill="#9B4A2E" opacity="0.5"/>
      <rect x="2"  y="22" width="16" height="16" rx="2"
        stroke="#9B4A2E" stroke-width="2" fill="none"/>
      <rect x="6"  y="26" width="8"  height="8"
        fill="#9B4A2E" opacity="0.5"/>
      <rect x="22" y="22" width="4"  height="4"  fill="#9B4A2E" opacity="0.5"/>
      <rect x="28" y="22" width="4"  height="4"  fill="#9B4A2E" opacity="0.5"/>
      <rect x="22" y="28" width="4"  height="4"  fill="#9B4A2E" opacity="0.5"/>
      <rect x="28" y="34" width="4"  height="4"  fill="#9B4A2E" opacity="0.5"/>
      <rect x="34" y="28" width="4"  height="4"  fill="#9B4A2E" opacity="0.5"/>
    </svg>
    <span style="font-family:'Jost',sans-serif;font-size:0.65rem;
      color:#6B4E4E;font-weight:400;letter-spacing:0.08em;line-height:1.4;">
      Actualiza<br>ALBUM_URL<br>en script.js
    </span>
  `;
  wrap.replaceChild(placeholder, imgEl);
}


/* ============================================================
   9. REPRODUCTOR DE MÚSICA
   ─────────────────────────────────────────────────────────────
   Coloca tu canción en:  musica/cancion.mp3
   Cambia el tooltip en:  index.html → .music-player__tooltip

   Formatos recomendados: MP3 (compatible con todos los navegadores)
   Duración ideal: canción completa, se reproduce en bucle (loop).

   Nota sobre autoplay:
   Los navegadores modernos bloquean el autoplay con sonido hasta
   que el usuario interactúa con la página. La función intenta
   arrancar automáticamente; si el navegador lo bloquea, el botón
   flotante invita al usuario a pulsar play.
   ============================================================ */
function initMusicPlayer() {
  const audio     = $('#wedding-audio');
  const btn       = $('#music-btn');
  const iconPlay  = $('#music-icon-play');
  const iconPause = $('#music-icon-pause');
  const tooltip   = $('#music-tooltip');

  if (!audio || !btn) return;

  audio.volume = 0.55;

  /* ── Estado ── */
  function setPlaying(playing) {
    btn.classList.toggle('playing', playing);
    if (iconPlay)  iconPlay.hidden  = playing;
    if (iconPause) iconPause.hidden = !playing;
    btn.setAttribute('aria-label',
      playing ? 'Pausar música' : 'Reproducir música de la boda');
  }

  /* ── Intentar autoplay al cargar ── */
  audio.play()
    .then(() => setPlaying(true))
    .catch(() => {
      /* Bloqueado por el navegador — esperar primera interacción del usuario */
      setPlaying(false);

      function startOnInteraction() {
        audio.play().then(() => {
          setPlaying(true);
          /* Limpiar todos los listeners una vez que arranca */
          ['click', 'scroll', 'touchstart', 'keydown'].forEach(ev =>
            document.removeEventListener(ev, startOnInteraction)
          );
        }).catch(() => {});
      }

      ['click', 'scroll', 'touchstart', 'keydown'].forEach(ev =>
        document.addEventListener(ev, startOnInteraction, { passive: true })
      );
    });

  /* ── Play / Pause al hacer clic ── */
  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => setPlaying(true));
    } else {
      audio.pause();
      setPlaying(false);
    }
  });

  /* ── Si la pista termina (no debería con loop, por si acaso) ── */
  audio.addEventListener('ended', () => setPlaying(false));
}


/* ============================================================
   INIT — Arrancar todo cuando el DOM esté listo
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHero();
  initScrollReveal();
  initCountdown();
  initRSVP();
  initConfirmedCounter();
  initGallery();
  initQR();
  initMusicPlayer();
  initRDMap();

  /* Easter egg en consola */

  console.log(
    '%c Wedding v1.0 ',
    'background:#9B4A2E;color:#FAF8F4;font-family:Georgia,serif;font-size:13px;padding:4px 14px;border-radius:4px;'
  );
  console.log(
    '%c Cesar & Lissette · 13 · III · 2027 · La Vega, RD ',
    'color:#C4A5B5;font-family:Georgia,serif;font-size:10px;'
  );
});

/* ── Mapa República Dominicana (Leaflet) ─────────────────────────── */
function initRDMap() {
  const el = document.getElementById('rd-mapa');
  if (!el || typeof L === 'undefined') return;

  const map = L.map('rd-mapa', { scrollWheelZoom: false, zoomControl: true })
    .setView([19.05, -70.15], 8);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19
  }).addTo(map);

  const makeIcon = (color, size) => L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px; height:${size}px; border-radius:50%;
      background:${color}; border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });

  const weddingIcon = makeIcon('#9B4A2E', 18);
  const cityIcon    = makeIcon('#8FAF8A', 13);

  const lugares = [
    { coords: [19.2217, -70.5292], label: '📍 La Vega — La boda', icon: weddingIcon },
    { coords: [19.4517, -70.6970], label: 'Santiago',     icon: cityIcon },
    { coords: [19.7934, -70.6878], label: 'Puerto Plata', icon: cityIcon },
    { coords: [19.1186, -70.6333], label: 'Jarabacoa',    icon: cityIcon },
    { coords: [19.2064, -69.3364], label: 'Samaná',       icon: cityIcon },
  ];

  lugares.forEach(({ coords, label, icon }) => {
    L.marker(coords, { icon })
      .bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -10],
        className: 'rd-tooltip' })
      .addTo(map);
  });
}
