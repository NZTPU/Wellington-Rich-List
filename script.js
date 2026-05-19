const featuredList = document.querySelector("#featured-list");
const staffList = document.querySelector("#staff-list");
const staffCount = document.querySelector("#staff-count");
const topPay = document.querySelector("#top-pay");
const totalPay = document.querySelector("#total-pay");
const ASSET_VERSION = "20260513-3";

const staff = Array.isArray(window.STAFF) ? window.STAFF : [];

function formatCurrency(value) {
  return `$${Math.round(value).toLocaleString("en-NZ")}`;
}

function personCard(person) {
  const article = document.createElement("article");
  article.className = "person";

  const portraitWrap = document.createElement("div");
  portraitWrap.className = "portrait-wrap";
  portraitWrap.setAttribute("role", "button");
  portraitWrap.setAttribute("tabindex", "0");
  portraitWrap.setAttribute("aria-label", `View ${person.name}`);
  portraitWrap.addEventListener("click", () => openLightbox(person));
  portraitWrap.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox(person);
    }
  });

  const image = document.createElement("img");
  image.className = "portrait";
  image.src = `${person.image}?v=${ASSET_VERSION}`;
  image.alt = person.name;
  image.loading = "eager";
  image.decoding = "async";
  portraitWrap.append(image);

  const name = document.createElement("div");
  name.className = "name";
  name.textContent = person.name;

  const role = document.createElement("div");
  role.className = "role";
  role.textContent = person.position;

  const group = document.createElement("div");
  group.className = "group";
  group.textContent = person.group;

  const pay = document.createElement("div");
  pay.className = "pay";
  pay.textContent = person.salaryLabel;

  article.append(portraitWrap, name, role, group, pay);
  return article;
}

function renderPeople() {
  featuredList.replaceChildren();
  staffList.replaceChildren();

  staff.slice(0, 3).forEach((person) => featuredList.append(personCard(person)));
  staff.slice(3).forEach((person) => staffList.append(personCard(person)));

}

function renderSummary() {
  const total = staff.reduce((sum, person) => sum + person.salary, 0);
  const highest = staff.reduce((max, person) => Math.max(max, person.salary), 0);
  staffCount.textContent = staff.length.toLocaleString("en-NZ");
  topPay.textContent = formatCurrency(highest);
  totalPay.textContent = formatCurrency(total);
}

/* ── Lightbox ──────────────────────────────────────── */

const lightbox = document.getElementById("lightbox");
const lightboxBackdrop = document.getElementById("lightbox-backdrop");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxName = document.getElementById("lightbox-name");
const lightboxRole = document.getElementById("lightbox-role");
const lightboxGroup = document.getElementById("lightbox-group");
const lightboxPay = document.getElementById("lightbox-pay");

function openLightbox(person) {
  lightboxImg.src = `${person.image}?v=${ASSET_VERSION}`;
  lightboxImg.alt = person.name;
  lightboxName.textContent = person.name;
  lightboxRole.textContent = person.position;
  lightboxGroup.textContent = person.group;
  lightboxPay.textContent = person.salaryLabel;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
}

lightboxClose.addEventListener("click", closeLightbox);
lightboxBackdrop.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
});

/* ── Lead gen popup ────────────────────────────────── */

const lgpop       = document.getElementById("lgpop");
const lgpopForm   = document.getElementById("lgpop-form");
const lgpopError  = document.getElementById("lgpop-error");
const lgpopThanks = document.getElementById("lgpop-thanks");

const ZAPIER_WEBHOOK = "https://hooks.zapier.com/hooks/catch/3173893/4o6xibt/";
const POPUP_KEY = "wrl_popup_seen";

function showPopup() {
  if (sessionStorage.getItem(POPUP_KEY)) return;
  document.body.style.overflow = "hidden";
  lgpop.classList.add("is-open");
}

function hidePopup(remember) {
  lgpop.classList.remove("is-open");
  document.body.style.overflow = "";
  if (remember) sessionStorage.setItem(POPUP_KEY, "1");
}

// Show after 15% scroll depth
let popupFired = false;
window.addEventListener("scroll", () => {
  if (popupFired || sessionStorage.getItem(POPUP_KEY)) return;
  const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  if (scrolled >= 0.15) {
    popupFired = true;
    setTimeout(showPopup, 400);
  }
}, { passive: true });

lgpopForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email     = document.getElementById("lgpop-email").value.trim();
  const firstName = document.getElementById("lgpop-firstname").value.trim();
  const lastName  = document.getElementById("lgpop-lastname").value.trim();
  const postcode  = document.getElementById("lgpop-postcode").value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    lgpopError.hidden = false;
    return;
  }
  lgpopError.hidden = true;

  // 1. Submit to Zapier webhook (fire-and-forget)
  fetch(ZAPIER_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_name: firstName, last_name: lastName, email, postcode }),
  }).catch(() => {});

  // 2. Show thank-you then close
  lgpopForm.style.display = "none";
  lgpopThanks.hidden = false;
  setTimeout(() => hidePopup(true), 3500);
});

/* ── Init ──────────────────────────────────────────── */

renderSummary();
renderPeople();
