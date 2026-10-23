/* Jacav Studio — demo · JS vanilla (menú, reveal, agenda WhatsApp) */

(function () {
  "use strict";

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal al hacer scroll ---------- */
  var revealSel = ".service-group, .welcome-card, .team-card, .review-card, .g-item, .info-block, .section-title, .lead";
  var revealEls = document.querySelectorAll(revealSel);
  revealEls.forEach(function (el) { el.setAttribute("data-rv", ""); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll("[data-rv]").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll("[data-rv]").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Agenda: bloques de hora según el día ---------- */
  var diaSel = document.getElementById("f-dia");
  var horaSel = document.getElementById("f-hora");
  var HORARIO = {
    Sabado: { inicio: 11, cierre: 19 }, // Sábado 11:00–19:00
    default: { inicio: 11, cierre: 20 } // L–V 11:00–20:00
  };

  function fillHoras(dia) {
    var r = (dia === "Sábado") ? HORARIO.Sabado : HORARIO.default;
    horaSel.innerHTML = "";
    var ph = document.createElement("option");
    ph.value = ""; ph.textContent = "Elige una hora"; ph.disabled = true; ph.selected = true;
    horaSel.appendChild(ph);
    var lastMin = r.cierre * 60 - 30; // última cita 30 min antes del cierre
    for (var m = r.inicio * 60; m <= lastMin; m += 30) {
      var hh = String(Math.floor(m / 60)).padStart(2, "0");
      var mm = String(m % 60).padStart(2, "0");
      var o = document.createElement("option");
      o.value = hh + ":" + mm; o.textContent = hh + ":" + mm;
      horaSel.appendChild(o);
    }
  }
  diaSel.addEventListener("change", function () { fillHoras(diaSel.value); });

  /* ---------- Envío: arma el mensaje de WhatsApp ---------- */
  var form = document.getElementById("form-reserva");
  var errorBox = document.createElement("p");
  errorBox.className = "form-error";
  errorBox.setAttribute("role", "alert");
  errorBox.style.display = "none";
  errorBox.style.cssText = "margin:0;font-size:13px;color:#c0392b;text-align:center;";
  form.appendChild(errorBox);

  function buildWhatsAppUrl(servicio, dia, hora, nombre, tel) {
    var msg = "Hola, quiero reservar: " + servicio + " · " + dia + " · " + hora + " · " + nombre;
    if (tel && tel.trim()) { msg += " · Tel: " + tel.trim(); }
    return "https://wa.me/56930562554?text=" + encodeURIComponent(msg);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var servicio = document.getElementById("f-servicio").value;
    var dia = diaSel.value;
    var hora = horaSel.value;
    var nombre = document.getElementById("f-nombre").value.trim();
    var tel = document.getElementById("f-tel").value.trim();

    var errores = [];
    if (!servicio) errores.push("Elige un servicio.");
    if (!dia) errores.push("Elige un día.");
    if (!hora) errores.push("Elige una hora.");
    if (!nombre) errores.push("Escribe tu nombre.");

    if (errores.length) {
      errorBox.textContent = errores.join(" ");
      errorBox.style.display = "block";
      return;
    }
    errorBox.style.display = "none";

    var url = buildWhatsAppUrl(servicio, dia, hora, nombre, tel);
    // La URL se lee en consola (verificación) y se abre para que el usuario envíe por WhatsApp.
    console.log("[Jacav] wa.me URL generada:", url);
    window.open(url, "_blank", "noopener");
  });

  /* Exponer la función para verificación headless (sin abrir nada). */
  window.__buildWhatsAppUrl = buildWhatsAppUrl;

  /* ---------- Parallax del hero (movimiento al hacer scroll) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var heroMedia = document.querySelector(".hero-media");
  var ticking = false;
  function clamp01(v){ return Math.min(1, Math.max(0, v)); }
  function updateParallax(){
    ticking = false;
    if(heroMedia && !reduceMotion){
      var h = window.innerHeight || 1;
      var r = heroMedia.getBoundingClientRect();
      var p = clamp01(-r.top / (r.height || h));
      heroMedia.style.setProperty("--hy", (p * 150).toFixed(1) + "px");
      heroMedia.style.setProperty("--hs", (1.04 + p * 0.10).toFixed(3));
    }
  }
  function onScrollParallax(){ if(ticking) return; ticking = true; requestAnimationFrame(updateParallax); }
  window.addEventListener("scroll", onScrollParallax, { passive: true });
  window.addEventListener("resize", onScrollParallax);
  updateParallax();
})();
