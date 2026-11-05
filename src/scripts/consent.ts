import { getConsent, setConsent, type Consent } from "../lib/storage";
import { GA_ID } from "../config/site";
import { toast } from "./ui";
import { enableAnalytics, disableAnalytics } from "../lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loaded = false;

/** Lädt gtag.js – nur nach ausdrücklicher Zustimmung. */
function loadAnalytics() {
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag erwartet das arguments-Objekt
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  // Seitenaufruf selbst senden, damit weder Fragment (#…) noch Parameter in der Adresse übertragen werden.
  // Keine Google-Signale, keine personalisierte Werbung.
  window.gtag("config", GA_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  window.gtag("event", "page_view", {
    page_location: location.origin + location.pathname,
    page_title: document.title,
  });
  enableAnalytics();
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

/** Entfernt die Google-Analytics-Cookies (_ga, _ga_*) für diese Domain. */
function removeAnalyticsCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (!/^_ga(_|$)/.test(name)) continue;
    for (const d of domains)
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
  }
}

const banner = document.querySelector<HTMLElement>("[data-consent]");
let opener: HTMLElement | null = null;

function show(focus: boolean) {
  if (!banner) return;
  banner.hidden = false;
  if (focus) banner.querySelector<HTMLButtonElement>("[data-consent-choice]")?.focus();
}
function hide() {
  if (!banner) return;
  banner.hidden = true;
  opener?.focus();
  opener = null;
}

function choose(c: Consent) {
  if (c === "denied") disableAnalytics();
  const before = getConsent();
  if (!setConsent(c))
    toast("Deine Auswahl konnte in diesem Browser nicht gespeichert werden. Sie gilt nur für diese Seite.", 6000);
  hide();
  if (c === "granted") {
    loadAnalytics();
    if (before !== "granted") toast("Danke! Die Nutzungsmessung ist aktiviert.");
  } else {
    removeAnalyticsCookies();
    if (loaded) {
      // Bereits geladenes gtag.js lässt sich nicht entladen: neu laden, damit es nicht weiterläuft.
      location.reload();
      return;
    }
    if (before === "granted") toast("Die Nutzungsmessung ist deaktiviert.");
  }
}

banner?.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-consent-choice]");
  if (btn) choose(btn.dataset.consentChoice as Consent);
});

document.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-consent-open]");
  if (!btn) return;
  e.preventDefault();
  opener = btn;
  show(true);
});

const current = getConsent();
if (current === "granted") loadAnalytics();
else if (current === null) show(false);
