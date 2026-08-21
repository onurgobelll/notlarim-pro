// GitHub Actions üzerinden periyodik çalışır: saati gelen notları kontrol eder,
// kayıtlı tüm cihazlara Firebase Cloud Messaging ile push bildirimi gönderir.
const admin = require("firebase-admin");

const SYNC_ID = "onur-notlarim";

function initAdmin() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.error("FIREBASE_SERVICE_ACCOUNT secret bulunamadı.");
    process.exit(1);
  }
  const credentials = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(credentials) });
}

function istanbulNow() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    hhmm: `${parts.hour}:${parts.minute}`,
    weekday: new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00`).getDay(),
    dayNum: Number(parts.day)
  };
}

// Bildirim penceresi: cron her ~15 dakikada bir çalıştığı için, notun saatiyle
// şu anki saat arasında birkaç dakikalık tolerans bırakıyoruz.
function withinWindow(targetHHMM, nowHHMM, windowMinutes = 16) {
  const [th, tm] = targetHHMM.split(":").map(Number);
  const [nh, nm] = nowHHMM.split(":").map(Number);
  const target = th * 60 + tm;
  const now = nh * 60 + nm;
  const diff = now - target;
  return diff >= 0 && diff < windowMinutes;
}

async function main() {
  initAdmin();
  const db = admin.firestore();
  const { dateKey, hhmm, weekday, dayNum } = istanbulNow();

  const notesSnap = await db.collection("users").doc(SYNC_ID).collection("notes").get();
  const tokensSnap = await db.collection("users").doc(SYNC_ID).collection("tokens").get();
  const tokens = tokensSnap.docs.map(d => d.id);

  if (!tokens.length) {
    console.log("Kayıtlı cihaz yok, çıkılıyor.");
    return;
  }

  const due = [];
  for (const docSnap of notesSnap.docs) {
    const n = docSnap.data();
    if (n.tamamlandi || !n.tarih) continue;
    if (n.atlananlar && n.atlananlar.includes(dateKey)) continue;

    const times = n.tekrar === "ozel" ? (n.ozelSaatler || []) : (n.saat ? [n.saat] : []);
    if (!times.length) continue;

    const noteDateKey = new Date(n.tarih).toISOString().slice(0, 10);
    const isToday = noteDateKey === dateKey;
    const dayMatches =
      n.tekrar === "gunluk" ? true :
      n.tekrar === "haftalik" ? new Date(n.tarih).getDay() === weekday :
      n.tekrar === "aylik" ? new Date(n.tarih).getDate() === dayNum :
      n.tekrar === "ozel" ? isToday :
      isToday;
    if (!dayMatches) continue;

    const matchedTime = times.find(t => withinWindow(t, hhmm));
    if (!matchedTime) continue;

    const fireKey = `${dateKey}|${matchedTime}`;
    if (n.lastNotifiedKey === fireKey) continue; // bu pencerede zaten gönderildi

    due.push({ id: docSnap.id, ref: docSnap.ref, note: n, fireKey });
  }

  if (!due.length) {
    console.log("Şu an bildirilecek not yok.");
    return;
  }

  for (const item of due) {
    const message = {
      tokens,
      notification: {
        title: item.note.baslik || "Notlarım",
        body: item.note.icerik || "Vaktin geldi!"
      },
      data: { noteId: item.id },
      webpush: {
        fcmOptions: { link: "/" }
      }
    };
    try {
      const resp = await admin.messaging().sendEachForMulticast(message);
      console.log(`"${item.note.baslik}" için ${resp.successCount}/${tokens.length} cihaza gönderildi.`);
      await item.ref.update({ lastNotifiedKey: item.fireKey });

      // Geçersiz/artık kayıtlı olmayan token'ları temizle
      resp.responses.forEach((r, i) => {
        if (!r.success && (r.error?.code === "messaging/registration-token-not-registered")) {
          db.collection("users").doc(SYNC_ID).collection("tokens").doc(tokens[i]).delete().catch(() => {});
        }
      });
    } catch (e) {
      console.error("Gönderim hatası:", e.message);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
