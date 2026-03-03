import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const supabaseUrl = "https://vodcrfucambrhkjahgjc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGNyZnVjYW1icmhramFoZ2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjgyMTEsImV4cCI6MjA4NzcwNDIxMX0.XuAhDtqN7mKPQnFnM9qyY226Lf9sJdTthRZLL2PucT4";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- DAS ZENTRIO LOGO (SVG) ---
const ZentrioLogo = ({ size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      marginRight: "12px",
      filter: "drop-shadow(0 2px 6px rgba(14, 165, 233, 0.4))",
    }}
  >
    <circle cx="12" cy="5" r="4" fill="url(#grad1)" />
    <circle cx="5" cy="18" r="4" fill="url(#grad2)" />
    <circle cx="19" cy="18" r="4" fill="url(#grad3)" />
    <path
      d="M10.5 8.5L6.5 14.5"
      stroke="#38bdf8"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M13.5 8.5L17.5 14.5"
      stroke="#818cf8"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M8 18H16"
      stroke="#6366f1"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient
        id="grad1"
        x1="12"
        y1="1"
        x2="12"
        y2="9"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#38bdf8" />
        <stop offset="1" stopColor="#0ea5e9" />
      </linearGradient>
      <linearGradient
        id="grad2"
        x1="5"
        y1="14"
        x2="5"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#60a5fa" />
        <stop offset="1" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient
        id="grad3"
        x1="19"
        y1="14"
        x2="19"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#818cf8" />
        <stop offset="1" stopColor="#6366f1" />
      </linearGradient>
    </defs>
  </svg>
);

function getMontag(datum) {
  const d = new Date(datum);
  const tag = d.getDay();
  const diff = d.getDate() - tag + (tag === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function baueDatumZusammen(datumObjekt, uhrzeitString) {
  const year = datumObjekt.getFullYear();
  const month = String(datumObjekt.getMonth() + 1).padStart(2, "0");
  const day = String(datumObjekt.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T${uhrzeitString}`;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- NEU: TOAST STATE ---
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    visible: false,
  });

  function showToast(message, type = "success") {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500); // Verschwindet nach 3.5 Sekunden
  }

  const [userProfiles, setUserProfiles] = useState([]);
  const [activeUnternehmenId, setActiveUnternehmenId] = useState(null);
  const [alleUnternehmen, setAlleUnternehmen] = useState([]);

  // God Mode
  const [godNewCompName, setGodNewCompName] = useState("");
  const [godCompSitz, setGodCompSitz] = useState("");
  const [godCompInhaber, setGodCompInhaber] = useState("");
  const [godCompGF, setGodCompGF] = useState("");
  const [godAdminName, setGodAdminName] = useState("");
  const [godAdminEmail, setGodAdminEmail] = useState("");

  const [mitarbeiter, setMitarbeiter] = useState([]);
  const [schichten, setSchichten] = useState([]);
  const [studios, setStudios] = useState([]);
  const [seminare, setSeminare] = useState([]);

  const [aktiverTab, setAktiverTab] = useState("dienstplan");
  const [aktivesStudioView, setAktivesStudioView] = useState("all");
  const [wochenStart, setWochenStart] = useState(() => getMontag(new Date()));

  // Business Tab Forms
  const [neuerName, setNeuerName] = useState("");
  const [neueEmail, setNeueEmail] = useState("");
  const [neueWochenstunden, setNeueWochenstunden] = useState("");
  const [neuerUrlaubsAnspruch, setNeuerUrlaubsAnspruch] = useState("24");
  const [neueRolle, setNeueRolle] = useState("Trainer");
  const [neueFreigabe, setNeueFreigabe] = useState(false);
  const [neuesStudioName, setNeuesStudioName] = useState("");

  // Edit Mitarbeiter
  const [editingMitarbeiterId, setEditingMitarbeiterId] = useState(null);
  const [editMitarbeiterName, setEditMitarbeiterName] = useState("");
  const [editMitarbeiterEmail, setEditMitarbeiterEmail] = useState("");
  const [editMitarbeiterStunden, setEditMitarbeiterStunden] = useState("");
  const [editMitarbeiterUrlaub, setEditMitarbeiterUrlaub] = useState("");
  const [editMitarbeiterRolle, setEditMitarbeiterRolle] = useState("");
  const [editMitarbeiterFreigabe, setEditMitarbeiterFreigabe] = useState(false);

  // Abwesenheiten Forms
  const [urlaubMitarbeiter, setUrlaubMitarbeiter] = useState("");
  const [urlaubStart, setUrlaubStart] = useState("");
  const [urlaubEnde, setUrlaubEnde] = useState("");
  const [seminarTitel, setSeminarTitel] = useState("");
  const [seminarStart, setSeminarStart] = useState("");
  const [seminarEnde, setSeminarEnde] = useState("");
  const [schuleMitarbeiter, setSchuleMitarbeiter] = useState("");
  const [schuleStartDatum, setSchuleStartDatum] = useState("");
  const [schuleEndDatum, setSchuleEndDatum] = useState("");
  const [schuleStartZeit, setSchuleStartZeit] = useState("08:00");
  const [schuleEndZeit, setSchuleEndZeit] = useState("16:00");

  const wochentage = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(wochenStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const wochenEnde = wochentage[6];

  const isGod =
    session?.user?.email?.trim().toLowerCase() === "arne-winckelmann@gmx.de";
  const currentUser = session
    ? userProfiles.find(
        (m) =>
          m.email.toLowerCase() === session.user.email.toLowerCase() &&
          m.unternehmen_id === activeUnternehmenId
      )
    : null;
  const isAdmin =
    currentUser?.rolle === "Inhaber" ||
    currentUser?.rolle === "Geschäftsführer" ||
    currentUser?.rolle === "Studioleiter" ||
    isGod;
  const canEdit = currentUser?.darf_schichten_aendern === true || isAdmin;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfiles(session.user.email);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfiles(session.user.email);
      else {
        setUserProfiles([]);
        setActiveUnternehmenId(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isGod && !activeUnternehmenId) setAktiverTab("system");
  }, [isGod, activeUnternehmenId]);

  useEffect(() => {
    if (activeUnternehmenId) ladeDaten();
    if (isGod && !activeUnternehmenId) ladeSystemDaten();
  }, [activeUnternehmenId, isGod]);

  async function fetchUserProfiles(email) {
    const { data } = await supabase
      .from("mitarbeiter")
      .select(`*, unternehmen ( name )`)
      .eq("email", email);
    if (data) {
      setUserProfiles(data);
      if (data.length === 1 && !isGod) {
        setActiveUnternehmenId(data[0].unternehmen_id);
        setAktiverTab("dienstplan");
      }
    }
  }

  async function ladeDaten() {
    if (!activeUnternehmenId) return;
    const uId = activeUnternehmenId;
    const [m, s, st, sem] = await Promise.all([
      supabase
        .from("mitarbeiter")
        .select("*")
        .eq("unternehmen_id", uId)
        .order("name"),
      supabase
        .from("schichten")
        .select(`*, mitarbeiter(name), studios(name)`)
        .eq("unternehmen_id", uId)
        .order("startzeit"),
      supabase
        .from("studios")
        .select("*")
        .eq("unternehmen_id", uId)
        .order("id"),
      supabase
        .from("seminare")
        .select("*")
        .eq("unternehmen_id", uId)
        .order("startzeit"),
    ]);
    if (m.data) setMitarbeiter(m.data);
    if (s.data) setSchichten(s.data);
    if (st.data) setStudios(st.data);
    if (sem.data) setSeminare(sem.data);
  }

  async function ladeSystemDaten() {
    const { data } = await supabase
      .from("unternehmen")
      .select("*, studios(id), mitarbeiter(id)")
      .order("name");
    if (data) setAlleUnternehmen(data);
  }

  // --- ACTIONS ---
  async function handleAuth(e) {
    e.preventDefault();
    setIsLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) {
        showToast(error.message, "error");
      } else {
        showToast(
          "Fast geschafft! Bitte checke jetzt dein E-Mail-Postfach.",
          "success"
        );
        setIsSignUp(false);
        setAuthPassword("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) showToast("Login fehlgeschlagen: " + error.message, "error");
    }
    setIsLoading(false);
  }

  async function handleResetPassword() {
    const email = prompt(
      "Bitte gib deine E-Mail-Adresse für den Reset-Link ein:"
    );
    if (email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) showToast(error.message, "error");
      else showToast("Reset-Link wurde gesendet.", "success");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // --- GOD MODE ACTIONS ---
  async function godCreateAndAssign(e) {
    e.preventDefault();
    setIsLoading(true);
    const { data: comp, error: compErr } = await supabase
      .from("unternehmen")
      .insert([
        {
          name: godNewCompName,
          sitz: godCompSitz,
          inhaber: godCompInhaber,
          geschaeftsfuehrer: godCompGF,
        },
      ])
      .select()
      .single();
    if (compErr) {
      showToast(compErr.message, "error");
      setIsLoading(false);
      return;
    }
    await supabase.from("mitarbeiter").insert([
      {
        name: godAdminName,
        email: godAdminEmail,
        rolle: "Inhaber",
        darf_schichten_aendern: true,
        wochenstunden: 40,
        urlaubs_anspruch: 30,
        unternehmen_id: comp.id,
      },
    ]);
    setGodNewCompName("");
    setGodCompSitz("");
    setGodCompInhaber("");
    setGodCompGF("");
    setGodAdminName("");
    setGodAdminEmail("");
    ladeSystemDaten();
    setIsLoading(false);
    showToast("Mandant erfolgreich angelegt.", "success");
  }

  async function godDeleteCompany(id) {
    if (
      !window.confirm(
        "Sicherheitsabfrage: Möchtest du diesen Mandanten unwiderruflich löschen?"
      )
    )
      return;
    await supabase.from("schichten").delete().eq("unternehmen_id", id);
    await supabase.from("seminare").delete().eq("unternehmen_id", id);
    await supabase.from("studios").delete().eq("unternehmen_id", id);
    await supabase.from("mitarbeiter").delete().eq("unternehmen_id", id);
    await supabase.from("unternehmen").delete().eq("id", id);
    ladeSystemDaten();
    showToast("Mandant gelöscht.", "success");
  }

  // --- BUSINESS LOGIC ---
  function berechneGesamtStunden(mId) {
    const sW = new Date(wochenStart).setHours(0, 0, 0, 0);
    const eW = new Date(wochenEnde).setHours(23, 59, 59, 999);
    const ms = schichten.filter(
      (s) =>
        s.mitarbeiter_id === mId &&
        s.status !== "Beantragt" &&
        new Date(s.startzeit) >= sW &&
        new Date(s.startzeit) <= eW
    );
    let min = 0;
    ms.forEach((s) => {
      if (["Arbeit", "Seminar", "Schule/Uni", "Krank"].includes(s.typ))
        min += (new Date(s.endzeit) - new Date(s.startzeit)) / 60000;
    });
    return min / 60;
  }

  function berechneTage(mId, typ) {
    const jahr = new Date().getFullYear();
    const ms = schichten.filter(
      (s) =>
        s.mitarbeiter_id === mId &&
        s.typ === typ &&
        s.status === "Genehmigt" &&
        new Date(s.startzeit).getFullYear() === jahr
    );
    let t = 0;
    ms.forEach((s) => {
      const diff = Math.ceil(
        Math.abs(new Date(s.endzeit) - new Date(s.startzeit)) /
          (1000 * 60 * 60 * 24)
      );
      t += diff === 0 ? 1 : diff;
    });
    return t;
  }

  async function schuleSpeichern(e) {
    e.preventDefault();
    const start = new Date(`${schuleStartDatum}T${schuleStartZeit}:00`);
    const ende = new Date(`${schuleEndDatum}T${schuleEndZeit}:00`);
    if (start >= ende)
      return showToast("Das Ende muss nach dem Start liegen.", "error");

    const ueberschneidung = schichten.some(
      (s) =>
        s.mitarbeiter_id == schuleMitarbeiter &&
        s.status !== "Beantragt" &&
        start < new Date(s.endzeit) &&
        ende > new Date(s.startzeit)
    );
    if (ueberschneidung)
      return showToast(
        "Doppelbuchung! Mitarbeiter ist da schon verplant.",
        "error"
      );

    await supabase.from("schichten").insert([
      {
        mitarbeiter_id: schuleMitarbeiter,
        startzeit: start.toISOString(),
        endzeit: ende.toISOString(),
        typ: "Schule/Uni",
        status: "Genehmigt",
        unternehmen_id: activeUnternehmenId,
      },
    ]);
    ladeDaten();
    setSchuleStartDatum("");
    setSchuleEndDatum("");
    showToast("Ausbildung eingetragen.", "success");
  }

  async function urlaubBeantragen(e) {
    e.preventDefault();
    const start = new Date(urlaubStart + "T00:00:00");
    const ende = new Date(urlaubEnde + "T23:59:59");
    if (start > ende)
      return showToast("Das Ende muss nach dem Start liegen.", "error");

    const ueberschneidung = schichten.some(
      (s) =>
        s.mitarbeiter_id == urlaubMitarbeiter &&
        s.status !== "Beantragt" &&
        start < new Date(s.endzeit) &&
        ende > new Date(s.startzeit)
    );
    if (ueberschneidung)
      return showToast(
        "Doppelbuchung! Mitarbeiter ist da schon verplant.",
        "error"
      );

    await supabase.from("schichten").insert([
      {
        mitarbeiter_id: urlaubMitarbeiter,
        startzeit: start.toISOString(),
        endzeit: ende.toISOString(),
        typ: "Urlaub",
        status: "Beantragt",
        unternehmen_id: activeUnternehmenId,
      },
    ]);
    ladeDaten();
    setUrlaubStart("");
    setUrlaubEnde("");
    showToast("Urlaub erfolgreich beantragt.", "success");
  }

  async function urlaubGenehmigen(id) {
    await supabase
      .from("schichten")
      .update({ status: "Genehmigt" })
      .eq("id", id);
    ladeDaten();
    showToast("Urlaub wurde genehmigt.", "success");
  }

  async function seminarSpeichern(e) {
    e.preventDefault();
    await supabase.from("seminare").insert([
      {
        titel: seminarTitel,
        startzeit: seminarStart,
        endzeit: seminarEnde,
        unternehmen_id: activeUnternehmenId,
      },
    ]);
    ladeDaten();
    setSeminarTitel("");
    setSeminarStart("");
    setSeminarEnde("");
    showToast("Seminar geplant.", "success");
  }

  async function seminarZuweisen(sem, mId) {
    if (!mId) return;
    const start = new Date(sem.startzeit);
    const ende = new Date(sem.endzeit);
    const ueberschneidung = schichten.some(
      (s) =>
        s.mitarbeiter_id == mId &&
        s.status !== "Beantragt" &&
        start < new Date(s.endzeit) &&
        ende > new Date(s.startzeit)
    );
    if (ueberschneidung)
      return showToast(
        "Doppelbuchung! Mitarbeiter ist da schon verplant.",
        "error"
      );

    await supabase.from("schichten").insert([
      {
        mitarbeiter_id: mId,
        startzeit: sem.startzeit,
        endzeit: sem.endzeit,
        typ: "Seminar",
        status: "Genehmigt",
        unternehmen_id: activeUnternehmenId,
      },
    ]);
    ladeDaten();
    showToast("Mitarbeiter zugewiesen.", "success");
  }

  async function schichtLoeschen(id) {
    if (!window.confirm("Diesen Eintrag wirklich löschen?")) return;
    await supabase.from("schichten").delete().eq("id", id);
    ladeDaten();
    showToast("Eintrag entfernt.", "success");
  }

  async function mitarbeiterSpeichern(e) {
    e.preventDefault();
    await supabase.from("mitarbeiter").insert([
      {
        name: neuerName,
        email: neueEmail,
        rolle: neueRolle,
        wochenstunden: parseFloat(neueWochenstunden) || 0,
        urlaubs_anspruch: parseInt(neuerUrlaubsAnspruch) || 24,
        darf_schichten_aendern: neueFreigabe,
        unternehmen_id: activeUnternehmenId,
      },
    ]);
    ladeDaten();
    setNeuerName("");
    setNeueEmail("");
    showToast("Mitarbeiter hinzugefügt.", "success");
  }

  async function mitarbeiterAktualisieren(id) {
    await supabase
      .from("mitarbeiter")
      .update({
        name: editMitarbeiterName,
        email: editMitarbeiterEmail,
        wochenstunden: parseFloat(editMitarbeiterStunden),
        urlaubs_anspruch: parseInt(editMitarbeiterUrlaub),
        rolle: editMitarbeiterRolle,
        darf_schichten_aendern: editMitarbeiterFreigabe,
      })
      .eq("id", id);
    setEditingMitarbeiterId(null);
    ladeDaten();
    showToast("Änderungen gespeichert.", "success");
  }

  async function mitarbeiterLoeschen(id) {
    if (!window.confirm("Diesen Mitarbeiter aus dem System entfernen?")) return;
    await supabase.from("mitarbeiter").delete().eq("id", id);
    ladeDaten();
    showToast("Mitarbeiter gelöscht.", "success");
  }

  async function studioSpeichern(e) {
    e.preventDefault();
    await supabase
      .from("studios")
      .insert([{ name: neuesStudioName, unternehmen_id: activeUnternehmenId }]);
    ladeDaten();
    setNeuesStudioName("");
    showToast("Studio hinzugefügt.", "success");
  }

  async function studioLoeschen(id) {
    if (!window.confirm("Diesen Standort löschen?")) return;
    await supabase.from("studios").delete().eq("id", id);
    ladeDaten();
    showToast("Studio gelöscht.", "success");
  }

  async function attestNachtragen(event, id) {
    const f = event.target.files[0];
    if (!f) return;
    document.body.style.cursor = "wait";
    const { data, error } = await supabase.storage
      .from("atteste")
      .upload(`${Date.now()}-${f.name}`, f);
    if (!error) {
      const url = supabase.storage.from("atteste").getPublicUrl(data.path)
        .data.publicUrl;
      await supabase.from("schichten").update({ attest_url: url }).eq("id", id);
      ladeDaten();
      showToast("Attest hochgeladen.", "success");
    } else {
      showToast("Upload fehlgeschlagen.", "error");
    }
    document.body.style.cursor = "default";
  }

  // --- VIEWS ---
  if (!session) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0b1120",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            background: "#111827",
            padding: "40px",
            borderRadius: "16px",
            border: "1px solid #1e293b",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <ZentrioLogo size={40} />
          </div>
          <h1
            style={{
              color: "#f8fafc",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: "900",
              letterSpacing: "2px",
              margin: "0 0 5px 0",
            }}
          >
            ZENTRIO
          </h1>
          <p
            style={{
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "14px",
              marginBottom: "30px",
            }}
          >
            Studio Management Platform
          </p>

          <form
            onSubmit={handleAuth}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="email"
              placeholder="E-Mail Adresse"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Passwort"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={isLoading} style={saveBtnStyle}>
              {isSignUp ? "Account aktivieren" : "Login"}
            </button>
          </form>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "25px",
              borderTop: "1px solid #1e293b",
              paddingTop: "20px",
            }}
          >
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                background: "transparent",
                border: "none",
                color: "#0ea5e9",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              {isSignUp ? "Zum Login" : "Registrieren"}
            </button>
            <button
              onClick={handleResetPassword}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Passwort vergessen?
            </button>
          </div>
        </div>

        {/* TOAST NOTIFICATION RENDERER */}
        {toast.visible && (
          <div
            style={{
              position: "fixed",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              background: toast.type === "error" ? "#ef4444" : "#10b981",
              color: "#fff",
              padding: "14px 24px",
              borderRadius: "10px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              zIndex: 9999,
              fontWeight: "bold",
              fontSize: "14px",
              animation:
                "slideUpToast 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <style>{`
              @keyframes slideUpToast {
                from { transform: translate(-50%, 100%); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
              }
            `}</style>
            {toast.type === "success" ? "✅" : "⚠️"} {toast.message}
          </div>
        )}
      </div>
    );
  }

  if (session && !activeUnternehmenId && !isGod) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0b1120",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            background: "#111827",
            padding: "40px",
            borderRadius: "16px",
            border: "1px solid #1e293b",
            width: "450px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <h2
            style={{
              color: "#f8fafc",
              textAlign: "center",
              marginTop: 0,
              fontSize: "20px",
            }}
          >
            Workspace auswählen
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "25px",
            }}
          >
            {userProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActiveUnternehmenId(p.unternehmen_id);
                  setAktiverTab("dienstplan");
                }}
                style={{
                  ...btnStyle,
                  padding: "18px",
                  fontSize: "16px",
                  background: "rgba(14, 165, 233, 0.05)",
                  border: "1px solid #0ea5e9",
                  textAlign: "left",
                  borderRadius: "10px",
                }}
              >
                <strong style={{ color: "#f8fafc" }}>
                  {p.unternehmen?.name}
                </strong>{" "}
                <br />
                <span
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    fontWeight: "normal",
                  }}
                >
                  Berechtigung: {p.rolle}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            style={{
              ...btnStyle,
              border: "none",
              color: "#ef4444",
              background: "transparent",
              width: "100%",
              marginTop: "20px",
            }}
          >
            Abmelden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="App"
      style={{
        backgroundColor: "#0b1120",
        minHeight: "100vh",
        color: "#f8fafc",
        fontFamily: "'Inter', sans-serif",
        padding: "20px",
        margin: "0 auto",
        maxWidth: "1400px",
      }}
    >
      <style>{`
        body { background-color: #0b1120; margin: 0; } 
        input[type="time"]::-webkit-calendar-picker-indicator, 
        input[type="date"]::-webkit-calendar-picker-indicator, 
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { 
          filter: invert(0.8) sepia(1) hue-rotate(180deg) saturate(200%); 
          cursor: pointer; 
        }
        @keyframes slideUpToast {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>

      <header
        style={{
          paddingBottom: "20px",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "35px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <ZentrioLogo />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: "900",
                letterSpacing: "1px",
                background: "linear-gradient(to right, #f8fafc, #94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ZENTRIO
            </h1>
            <div
              style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}
            >
              Workspace:{" "}
              <strong
                style={{
                  color: isGod && !activeUnternehmenId ? "#ef4444" : "#0ea5e9",
                }}
              >
                {isGod && !activeUnternehmenId
                  ? "Zentrale"
                  : userProfiles.find(
                      (p) => p.unternehmen_id === activeUnternehmenId
                    )?.unternehmen?.name || "Kunde"}
              </strong>{" "}
              | {session.user.email}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {isGod && !activeUnternehmenId && (
            <button style={tabStyle(true, "#ef4444")}>Alle Workspaces</button>
          )}
          {isGod && activeUnternehmenId && (
            <button
              onClick={() => {
                setActiveUnternehmenId(null);
                setAktiverTab("system");
              }}
              style={{
                border: "1px solid #ef4444",
                color: "#ef4444",
                background: "rgba(239, 68, 68, 0.1)",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              Zurück zur Zentrale
            </button>
          )}

          {activeUnternehmenId && (
            <>
              <button
                onClick={() => setAktiverTab("dienstplan")}
                style={tabStyle(aktiverTab === "dienstplan")}
              >
                Dienstplan
              </button>
              <button
                onClick={() => setAktiverTab("schule")}
                style={tabStyle(aktiverTab === "schule", "#10b981")}
              >
                Ausbildung
              </button>
              <button
                onClick={() => setAktiverTab("seminare")}
                style={tabStyle(aktiverTab === "seminare", "#8b5cf6")}
              >
                Seminare
              </button>
              <button
                onClick={() => setAktiverTab("urlaub")}
                style={tabStyle(aktiverTab === "urlaub", "#f59e0b")}
              >
                Urlaub
              </button>
              {isAdmin && (
                <button
                  onClick={() => setAktiverTab("mein_unternehmen")}
                  style={tabStyle(aktiverTab === "mein_unternehmen", "#6366f1")}
                >
                  Unternehmen
                </button>
              )}
            </>
          )}
          {!isGod && userProfiles.length > 1 && activeUnternehmenId && (
            <button
              onClick={() => setActiveUnternehmenId(null)}
              style={{
                ...btnStyle,
                background: "transparent",
                color: "#0ea5e9",
                borderColor: "#0ea5e9",
              }}
            >
              Wechseln
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              marginLeft: "15px",
              color: "#ef4444",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            Abmelden
          </button>
        </div>
      </header>

      {/* WOCHEN WÄHLER */}
      {["dienstplan", "mein_unternehmen"].includes(aktiverTab) &&
        activeUnternehmenId && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "25px",
              marginBottom: "35px",
              background: "#111827",
              padding: "15px 25px",
              borderRadius: "12px",
              border: "1px solid #1e293b",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <button
              onClick={() =>
                setWochenStart(
                  new Date(wochenStart.setDate(wochenStart.getDate() - 7))
                )
              }
              style={btnStyle}
            >
              Vorherige
            </button>
            <h2
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "normal",
                color: "#94a3b8",
                letterSpacing: "1px",
              }}
            >
              Woche:{" "}
              <strong style={{ color: "#f8fafc", fontSize: "16px" }}>
                {wochenStart.toLocaleDateString()} -{" "}
                {wochenEnde.toLocaleDateString()}
              </strong>
            </h2>
            <button
              onClick={() =>
                setWochenStart(
                  new Date(wochenStart.setDate(wochenStart.getDate() + 7))
                )
              }
              style={btnStyle}
            >
              Nächste
            </button>
          </div>
        )}

      {/* --- TAB: SYSTEM ADMIN --- */}
      {aktiverTab === "system" && isGod && !activeUnternehmenId && (
        <div>
          <div
            style={{
              background: "linear-gradient(145deg, #111827, #0b1120)",
              padding: "30px",
              borderRadius: "16px",
              border: "1px solid #1e293b",
              borderTop: "2px solid #ef4444",
              marginBottom: "40px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#f8fafc", fontSize: "18px" }}>
              Neuen Mandanten anlegen
            </h3>
            <form
              onSubmit={godCreateAndAssign}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <label style={labelStyle}>Firmenname</label>
                <input
                  value={godNewCompName}
                  onChange={(e) => setGodNewCompName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Sitz / Adresse</label>
                <input
                  value={godCompSitz}
                  onChange={(e) => setGodCompSitz(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Inhaber</label>
                <input
                  value={godCompInhaber}
                  onChange={(e) => setGodCompInhaber(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Geschäftsführer</label>
                <input
                  value={godCompGF}
                  onChange={(e) => setGodCompGF(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Admin-Name</label>
                <input
                  value={godAdminName}
                  onChange={(e) => setGodAdminName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Admin-E-Mail</label>
                <input
                  type="email"
                  value={godAdminEmail}
                  onChange={(e) => setGodAdminEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...saveBtnStyle,
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  height: "48px",
                  marginTop: "24px",
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)",
                }}
              >
                Mandant gründen
              </button>
            </form>
          </div>

          <h2
            style={{
              color: "#f8fafc",
              borderBottom: "1px solid #1e293b",
              paddingBottom: "15px",
              fontSize: "20px",
            }}
          >
            Kunden Workspaces
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "25px",
            }}
          >
            {alleUnternehmen.map((u) => (
              <div
                key={u.id}
                style={{
                  background: "#111827",
                  border: "1px solid #1e293b",
                  padding: "25px",
                  borderRadius: "16px",
                  transition: "transform 0.2s",
                  cursor: "default",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
              >
                <h3
                  style={{
                    margin: "0 0 15px 0",
                    fontSize: "18px",
                    color: "#0ea5e9",
                  }}
                >
                  {u.name}
                </h3>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    lineHeight: "1.8",
                    marginBottom: "25px",
                    background: "#0b1120",
                    padding: "15px",
                    borderRadius: "8px",
                    border: "1px solid #1e293b",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      width: "70px",
                      display: "inline-block",
                    }}
                  >
                    Sitz:
                  </span>{" "}
                  <span style={{ color: "#f8fafc" }}>{u.sitz || "-"}</span>
                  <br />
                  <span
                    style={{
                      color: "#64748b",
                      width: "70px",
                      display: "inline-block",
                    }}
                  >
                    Inhaber:
                  </span>{" "}
                  <span style={{ color: "#f8fafc" }}>{u.inhaber || "-"}</span>
                  <br />
                  <span
                    style={{
                      color: "#64748b",
                      width: "70px",
                      display: "inline-block",
                    }}
                  >
                    GF:
                  </span>{" "}
                  <span style={{ color: "#f8fafc" }}>
                    {u.geschaeftsfuehrer || "-"}
                  </span>
                </div>
                <div
                  style={{ display: "flex", gap: "15px", marginBottom: "20px" }}
                >
                  <div
                    style={{
                      background: "rgba(14, 165, 233, 0.1)",
                      padding: "10px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#0ea5e9",
                      flex: 1,
                      textAlign: "center",
                      border: "1px solid rgba(14, 165, 233, 0.2)",
                    }}
                  >
                    Studios
                    <br />
                    <strong style={{ color: "#f8fafc", fontSize: "16px" }}>
                      {u.studios?.length || 0}
                    </strong>
                  </div>
                  <div
                    style={{
                      background: "rgba(99, 102, 241, 0.1)",
                      padding: "10px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#818cf8",
                      flex: 1,
                      textAlign: "center",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                    }}
                  >
                    Mitarbeiter
                    <br />
                    <strong style={{ color: "#f8fafc", fontSize: "16px" }}>
                      {u.mitarbeiter?.length || 0}
                    </strong>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      setActiveUnternehmenId(u.id);
                      setAktiverTab("mein_unternehmen");
                    }}
                    style={{
                      ...saveBtnStyle,
                      flex: 1,
                      fontSize: "13px",
                      background: "#1f2937",
                      color: "#f8fafc",
                      boxShadow: "none",
                      border: "1px solid #374151",
                    }}
                  >
                    Öffnen
                  </button>
                  <button
                    onClick={() => godDeleteCompany(u.id)}
                    style={textBtnStyle}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB: BUSINESS / MEIN UNTERNEHMEN --- */}
      {aktiverTab === "mein_unternehmen" && activeUnternehmenId && isAdmin && (
        <div>
          <div
            style={{
              background: "#111827",
              padding: "30px",
              borderRadius: "16px",
              border: "1px solid #1e293b",
              marginBottom: "40px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#f8fafc",
                borderBottom: "1px solid #1e293b",
                paddingBottom: "15px",
                fontSize: "18px",
              }}
            >
              Standorte verwalten
            </h3>
            <form
              onSubmit={studioSpeichern}
              style={{ display: "flex", gap: "15px", marginBottom: "25px" }}
            >
              <input
                placeholder="Neues Studio benennen..."
                value={neuesStudioName}
                onChange={(e) => setNeuesStudioName(e.target.value)}
                required
                style={{ ...inputStyle, maxWidth: "350px" }}
              />
              <button type="submit" style={saveBtnStyle}>
                Hinzufügen
              </button>
            </form>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
              {studios.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: "#1f2937",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "1px solid #374151",
                    display: "flex",
                    gap: "15px",
                    alignItems: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <strong style={{ fontSize: "15px", fontWeight: "600" }}>
                    {s.name}
                  </strong>{" "}
                  <button
                    onClick={() => studioLoeschen(s.id)}
                    style={{
                      color: "#ef4444",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Entfernen
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#111827",
              padding: "30px",
              borderRadius: "16px",
              border: "1px solid #1e293b",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#f8fafc",
                borderBottom: "1px solid #1e293b",
                paddingBottom: "15px",
                fontSize: "18px",
              }}
            >
              Personalverwaltung
            </h3>
            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
              <div
                style={{
                  flex: "0 0 320px",
                  background: "#0b1120",
                  padding: "25px",
                  borderRadius: "12px",
                  border: "1px solid #1e293b",
                }}
              >
                <h4
                  style={{ marginTop: 0, color: "#0ea5e9", fontSize: "16px" }}
                >
                  Mitarbeiter anlegen
                </h4>
                <form
                  onSubmit={mitarbeiterSpeichern}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Name</label>
                    <input
                      value={neuerName}
                      onChange={(e) => setNeuerName(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>E-Mail (Login)</label>
                    <input
                      type="email"
                      value={neueEmail}
                      onChange={(e) => setNeueEmail(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Soll Std/Wo</label>
                      <input
                        type="number"
                        step="0.5"
                        value={neueWochenstunden}
                        onChange={(e) => setNeueWochenstunden(e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Urlaub/Jahr</label>
                      <input
                        type="number"
                        value={neuerUrlaubsAnspruch}
                        onChange={(e) =>
                          setNeuerUrlaubsAnspruch(e.target.value)
                        }
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>System-Rolle</label>
                    <select
                      value={neueRolle}
                      onChange={(e) => setNeueRolle(e.target.value)}
                      style={inputStyle}
                    >
                      <option>Trainer</option>
                      <option>Studioleiter</option>
                      <option>Geschäftsführer</option>
                      <option>Inhaber</option>
                    </select>
                  </div>
                  <label
                    style={{
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#94a3b8",
                      cursor: "pointer",
                      marginTop: "5px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={neueFreigabe}
                      onChange={(e) => setNeueFreigabe(e.target.checked)}
                      style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "#0ea5e9",
                      }}
                    />{" "}
                    Planungs-Rechte erteilen
                  </label>
                  <button
                    type="submit"
                    style={{ ...saveBtnStyle, marginTop: "10px" }}
                  >
                    Hinzufügen
                  </button>
                </form>
              </div>

              <div style={{ flex: "1 1 600px", overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    background: "#0b1120",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #1e293b",
                  }}
                >
                  <thead
                    style={{
                      background: "#1f2937",
                      borderBottom: "1px solid #374151",
                    }}
                  >
                    <tr>
                      <th style={thStyle}>Personal</th>
                      <th style={thStyle}>Std/Wo</th>
                      <th style={thStyle}>Urlaub</th>
                      <th style={thStyle}>Krank</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mitarbeiter.map((m) => {
                      const ist = berechneGesamtStunden(m.id);
                      const soll = parseFloat(m.wochenstunden) || 0;
                      const diff = (ist - soll).toFixed(1);
                      const diffCol =
                        diff > 0 ? "#10b981" : diff < 0 ? "#ef4444" : "#94a3b8";

                      return editingMitarbeiterId === m.id ? (
                        <tr
                          key={m.id}
                          style={{
                            background: "#1e293b",
                            borderBottom: "1px solid #374151",
                          }}
                        >
                          <td style={tdStyle}>
                            <input
                              value={editMitarbeiterName}
                              onChange={(e) =>
                                setEditMitarbeiterName(e.target.value)
                              }
                              style={{
                                ...inputStyle,
                                padding: "8px",
                                marginBottom: "8px",
                              }}
                            />
                            <br />
                            <input
                              type="email"
                              value={editMitarbeiterEmail}
                              onChange={(e) =>
                                setEditMitarbeiterEmail(e.target.value)
                              }
                              style={{
                                ...inputStyle,
                                padding: "8px",
                                marginBottom: "8px",
                              }}
                            />
                            <br />
                            <select
                              value={editMitarbeiterRolle}
                              onChange={(e) =>
                                setEditMitarbeiterRolle(e.target.value)
                              }
                              style={{ ...inputStyle, padding: "8px" }}
                            >
                              <option>Trainer</option>
                              <option>Studioleiter</option>
                              <option>Geschäftsführer</option>
                              <option>Inhaber</option>
                            </select>
                            <br />
                            <label
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                                display: "inline-block",
                                marginTop: "8px",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={editMitarbeiterFreigabe}
                                onChange={(e) =>
                                  setEditMitarbeiterFreigabe(e.target.checked)
                                }
                              />{" "}
                              Planungs-Rechte
                            </label>
                          </td>
                          <td style={tdStyle}>
                            <input
                              type="number"
                              step="0.5"
                              value={editMitarbeiterStunden}
                              onChange={(e) =>
                                setEditMitarbeiterStunden(e.target.value)
                              }
                              style={{
                                ...inputStyle,
                                width: "70px",
                                padding: "8px",
                              }}
                            />
                          </td>
                          <td style={tdStyle}>
                            <input
                              type="number"
                              value={editMitarbeiterUrlaub}
                              onChange={(e) =>
                                setEditMitarbeiterUrlaub(e.target.value)
                              }
                              style={{
                                ...inputStyle,
                                width: "70px",
                                padding: "8px",
                              }}
                            />
                          </td>
                          <td style={tdStyle}>-</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>
                            <button
                              onClick={() => mitarbeiterAktualisieren(m.id)}
                              style={{
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                              }}
                            >
                              Speichern
                            </button>
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={m.id}
                          style={{
                            borderBottom: "1px solid #1e293b",
                            transition: "0.2s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = "#111827")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td style={tdStyle}>
                            <strong
                              style={{ color: "#f8fafc", fontSize: "14px" }}
                            >
                              {m.name}
                            </strong>
                            <br />
                            <span
                              style={{ fontSize: "12px", color: "#94a3b8" }}
                            >
                              {m.email}
                            </span>
                            <br />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "8px",
                              }}
                            >
                              <span
                                style={{
                                  border: "1px solid #3b82f6",
                                  color: "#60a5fa",
                                  background: "rgba(59,130,246,0.1)",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "10px",
                                  textTransform: "uppercase",
                                  fontWeight: "bold",
                                }}
                              >
                                {m.rolle}
                              </span>{" "}
                              {m.darf_schichten_aendern && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    color: "#10b981",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Freigegeben
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                              Soll: {soll.toFixed(1)} | Ist:{" "}
                              <strong style={{ color: "#f8fafc" }}>
                                {ist.toFixed(1)}
                              </strong>
                            </div>
                            <div
                              style={{
                                color: diffCol,
                                fontWeight: "bold",
                                fontSize: "13px",
                                marginTop: "4px",
                              }}
                            >
                              {diff > 0 ? "+" : ""}
                              {diff} Std.
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <div
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                color: "#f59e0b",
                              }}
                            >
                              {berechneTage(m.id, "Urlaub")}{" "}
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "#94a3b8",
                                  fontWeight: "normal",
                                }}
                              >
                                / {m.urlaubs_anspruch}
                              </span>
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <div
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                color: "#ef4444",
                              }}
                            >
                              {berechneTage(m.id, "Krank")}{" "}
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "#94a3b8",
                                  fontWeight: "normal",
                                }}
                              >
                                Tage
                              </span>
                            </div>
                          </td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>
                            <button
                              onClick={() => {
                                setEditingMitarbeiterId(m.id);
                                setEditMitarbeiterName(m.name);
                                setEditMitarbeiterEmail(m.email);
                                setEditMitarbeiterStunden(m.wochenstunden);
                                setEditMitarbeiterUrlaub(m.urlaubs_anspruch);
                                setEditMitarbeiterRolle(m.rolle);
                                setEditMitarbeiterFreigabe(
                                  m.darf_schichten_aendern
                                );
                              }}
                              style={textBtnStyle}
                            >
                              Bearbeiten
                            </button>
                            <button
                              onClick={() => mitarbeiterLoeschen(m.id)}
                              style={{ ...textBtnStyle, color: "#ef4444" }}
                            >
                              Löschen
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: DIENSTPLAN --- */}
      {aktiverTab === "dienstplan" && activeUnternehmenId && (
        <div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              marginBottom: "35px",
              paddingBottom: "10px",
            }}
          >
            <button
              onClick={() => setAktivesStudioView("all")}
              style={{
                ...btnStyle,
                padding: "10px 20px",
                background:
                  aktivesStudioView === "all"
                    ? "linear-gradient(135deg, #0ea5e9, #3b82f6)"
                    : "#111827",
                color: aktivesStudioView === "all" ? "#fff" : "#94a3b8",
                border:
                  aktivesStudioView === "all" ? "none" : "1px solid #1e293b",
                boxShadow:
                  aktivesStudioView === "all"
                    ? "0 4px 14px rgba(14, 165, 233, 0.3)"
                    : "none",
              }}
            >
              Gesamt-Ansicht
            </button>
            {studios.map((s) => (
              <button
                key={s.id}
                onClick={() => setAktivesStudioView(s.id.toString())}
                style={{
                  ...btnStyle,
                  padding: "10px 20px",
                  background:
                    aktivesStudioView === s.id.toString()
                      ? "linear-gradient(135deg, #0ea5e9, #3b82f6)"
                      : "#111827",
                  color:
                    aktivesStudioView === s.id.toString() ? "#fff" : "#94a3b8",
                  border:
                    aktivesStudioView === s.id.toString()
                      ? "none"
                      : "1px solid #1e293b",
                  boxShadow:
                    aktivesStudioView === s.id.toString()
                      ? "0 4px 14px rgba(14, 165, 233, 0.3)"
                      : "none",
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
          {studios
            .filter(
              (studio) =>
                aktivesStudioView === "all" ||
                studio.id.toString() === aktivesStudioView
            )
            .map((studio) => (
              <StudioKalenderKachel
                key={studio.id}
                studio={studio}
                alleSchichten={schichten}
                alleMitarbeiter={mitarbeiter}
                ladeDaten={ladeDaten}
                wochentage={wochentage}
                attestNachtragen={attestNachtragen}
                canEdit={canEdit}
                currentUnternehmenId={activeUnternehmenId}
                showToast={showToast}
              />
            ))}
          <StudioKalenderKachel
            isAusserHaus={true}
            studio={{ id: null, name: "Off-Site (Abwesenheiten)" }}
            alleSchichten={schichten}
            alleMitarbeiter={mitarbeiter}
            ladeDaten={ladeDaten}
            wochentage={wochentage}
            attestNachtragen={attestNachtragen}
            canEdit={canEdit}
            currentUnternehmenId={activeUnternehmenId}
            showToast={showToast}
          />
        </div>
      )}

      {/* --- TAB: SCHULE --- */}
      {aktiverTab === "schule" && activeUnternehmenId && (
        <div
          style={{
            display: "flex",
            gap: "40px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {canEdit && (
            <div
              style={{
                background: "#111827",
                padding: "30px",
                borderRadius: "16px",
                flex: "0 0 340px",
                border: "1px solid #1e293b",
                borderTop: "3px solid #10b981",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#10b981", fontSize: "18px" }}>
                Neuer Blockunterricht
              </h3>
              <form
                onSubmit={schuleSpeichern}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  marginTop: "20px",
                }}
              >
                <div>
                  <label style={labelStyle}>Mitarbeiter</label>
                  <select
                    value={schuleMitarbeiter}
                    onChange={(e) => setSchuleMitarbeiter(e.target.value)}
                    required
                    style={inputStyle}
                  >
                    <option value="">-- Auswählen --</option>
                    {mitarbeiter.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Start Datum</label>
                    <input
                      type="date"
                      value={schuleStartDatum}
                      onChange={(e) => setSchuleStartDatum(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>End Datum</label>
                    <input
                      type="date"
                      value={schuleEndDatum}
                      onChange={(e) => setSchuleEndDatum(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Startzeit</label>
                    <input
                      type="time"
                      value={schuleStartZeit}
                      onChange={(e) => setSchuleStartZeit(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Endzeit</label>
                    <input
                      type="time"
                      value={schuleEndZeit}
                      onChange={(e) => setSchuleEndZeit(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    ...saveBtnStyle,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                    marginTop: "10px",
                  }}
                >
                  Block eintragen
                </button>
              </form>
            </div>
          )}
          <div style={{ flex: "1 1 500px" }}>
            <h3 style={{ marginTop: 0, color: "#f8fafc", fontSize: "18px" }}>
              Geplante Ausbildungen
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              {schichten
                .filter(
                  (s) =>
                    s.typ === "Schule/Uni" &&
                    new Date(s.endzeit) >= new Date().setHours(0, 0, 0, 0)
                )
                .sort((a, b) => new Date(a.startzeit) - new Date(b.startzeit))
                .map((s) => {
                  const isMultiDay =
                    new Date(s.startzeit).toDateString() !==
                    new Date(s.endzeit).toDateString();
                  return (
                    <div
                      key={s.id}
                      style={{
                        background: "#111827",
                        padding: "18px 20px",
                        borderLeft: "4px solid #10b981",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid #1e293b",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#10b981", fontSize: "15px" }}>
                          {s.mitarbeiter?.name}
                        </strong>
                        <br />
                        {isMultiDay ? (
                          <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                            Vom{" "}
                            <strong style={{ color: "#cbd5e1" }}>
                              {new Date(s.startzeit).toLocaleDateString()}
                            </strong>{" "}
                            bis{" "}
                            <strong style={{ color: "#cbd5e1" }}>
                              {new Date(s.endzeit).toLocaleDateString()}
                            </strong>
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                            Am{" "}
                            <strong style={{ color: "#cbd5e1" }}>
                              {new Date(s.startzeit).toLocaleDateString()}
                            </strong>
                          </span>
                        )}
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => schichtLoeschen(s.id)}
                          style={{ ...textBtnStyle, color: "#ef4444" }}
                        >
                          Löschen
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: URLAUB --- */}
      {aktiverTab === "urlaub" && activeUnternehmenId && (
        <div
          style={{
            display: "flex",
            gap: "40px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "#111827",
              padding: "30px",
              borderRadius: "16px",
              flex: "0 0 340px",
              border: "1px solid #1e293b",
              borderTop: "3px solid #f59e0b",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#f59e0b", fontSize: "18px" }}>
              Urlaubsantrag
            </h3>
            <form
              onSubmit={urlaubBeantragen}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                marginTop: "20px",
              }}
            >
              <div>
                <label style={labelStyle}>Mitarbeiter</label>
                <select
                  value={urlaubMitarbeiter}
                  onChange={(e) => setUrlaubMitarbeiter(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">-- Wer beantragt? --</option>
                  {mitarbeiter.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Vom (inkl.)</label>
                <input
                  type="date"
                  value={urlaubStart}
                  onChange={(e) => setUrlaubStart(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Bis (inkl.)</label>
                <input
                  type="date"
                  value={urlaubEnde}
                  onChange={(e) => setUrlaubEnde(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                style={{
                  ...saveBtnStyle,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
                  marginTop: "10px",
                }}
              >
                Beantragen
              </button>
            </form>
          </div>
          <div style={{ flex: "1 1 500px" }}>
            <h3 style={{ marginTop: 0, color: "#f8fafc", fontSize: "18px" }}>
              Ausstehende Anträge
            </h3>
            <div style={{ marginTop: "20px" }}>
              {schichten
                .filter((s) => s.typ === "Urlaub" && s.status === "Beantragt")
                .map((u) => (
                  <div
                    key={u.id}
                    style={{
                      background: "#111827",
                      padding: "25px",
                      marginBottom: "15px",
                      borderLeft: "4px solid #f59e0b",
                      borderRadius: "12px",
                      border: "1px solid #1e293b",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{ fontSize: "14px", color: "#e2e8f0" }}>
                      <strong style={{ color: "#f59e0b", fontSize: "16px" }}>
                        {u.mitarbeiter?.name}
                      </strong>{" "}
                      beantragt Urlaub vom{" "}
                      <strong style={{ color: "#fff" }}>
                        {new Date(u.startzeit).toLocaleDateString()}
                      </strong>{" "}
                      bis{" "}
                      <strong style={{ color: "#fff" }}>
                        {new Date(u.endzeit).toLocaleDateString()}
                      </strong>
                    </div>
                    {isAdmin ? (
                      <div
                        style={{
                          marginTop: "20px",
                          display: "flex",
                          gap: "12px",
                        }}
                      >
                        <button
                          onClick={() => urlaubGenehmigen(u.id)}
                          style={{
                            background:
                              "linear-gradient(135deg, #10b981, #059669)",
                            color: "#fff",
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
                          }}
                        >
                          Genehmigen
                        </button>
                        <button
                          onClick={() => schichtLoeschen(u.id)}
                          style={{
                            background:
                              "linear-gradient(135deg, #ef4444, #dc2626)",
                            color: "#fff",
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
                          }}
                        >
                          Ablehnen
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: "15px",
                          fontSize: "12px",
                          color: "#94a3b8",
                          background: "#0b1120",
                          padding: "10px",
                          borderRadius: "6px",
                          display: "inline-block",
                          border: "1px solid #1e293b",
                        }}
                      >
                        Wartet auf Freigabe.
                      </div>
                    )}
                  </div>
                ))}
              {schichten.filter(
                (s) => s.typ === "Urlaub" && s.status === "Beantragt"
              ).length === 0 && (
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                  Keine offenen Urlaubsanträge.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: SEMINARE --- */}
      {aktiverTab === "seminare" && activeUnternehmenId && (
        <div
          style={{
            display: "flex",
            gap: "40px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {isAdmin && (
            <div
              style={{
                background: "#111827",
                padding: "30px",
                borderRadius: "16px",
                flex: "0 0 340px",
                border: "1px solid #1e293b",
                borderTop: "3px solid #8b5cf6",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#8b5cf6", fontSize: "18px" }}>
                Neues Seminar
              </h3>
              <form
                onSubmit={seminarSpeichern}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  marginTop: "20px",
                }}
              >
                <div>
                  <label style={labelStyle}>Titel / Thema</label>
                  <input
                    type="text"
                    value={seminarTitel}
                    onChange={(e) => setSeminarTitel(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Start</label>
                  <input
                    type="datetime-local"
                    value={seminarStart}
                    onChange={(e) => setSeminarStart(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Ende</label>
                  <input
                    type="datetime-local"
                    value={seminarEnde}
                    onChange={(e) => setSeminarEnde(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    ...saveBtnStyle,
                    background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                    boxShadow: "0 4px 14px rgba(139, 92, 246, 0.3)",
                    marginTop: "10px",
                  }}
                >
                  Planen
                </button>
              </form>
            </div>
          )}
          <div style={{ flex: "1 1 500px" }}>
            <h3 style={{ marginTop: 0, color: "#f8fafc", fontSize: "18px" }}>
              Geplante Fortbildungen
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              {seminare.map((sem) => {
                const assigned = schichten.filter(
                  (s) =>
                    s.typ === "Seminar" &&
                    new Date(s.startzeit).getTime() ===
                      new Date(sem.startzeit).getTime()
                );
                return (
                  <div
                    key={sem.id}
                    style={{
                      background: "#111827",
                      padding: "25px",
                      borderRadius: "12px",
                      borderLeft: "4px solid #8b5cf6",
                      flex: "1 1 320px",
                      border: "1px solid #1e293b",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 8px 0",
                        color: "#f8fafc",
                        fontSize: "16px",
                      }}
                    >
                      {sem.titel}
                    </h4>
                    <p
                      style={{
                        margin: "0 0 20px 0",
                        fontSize: "13px",
                        color: "#94a3b8",
                      }}
                    >
                      {new Date(sem.startzeit).toLocaleString("de-DE")} -{" "}
                      {new Date(sem.endzeit).toLocaleTimeString("de-DE")} Uhr
                    </p>
                    {isAdmin && (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginBottom: "20px",
                        }}
                      >
                        <select
                          id={`sem-${sem.id}`}
                          style={{ ...inputStyle, padding: "10px", flex: 1 }}
                        >
                          <option value="">-- Teilnehmer zuweisen --</option>
                          {mitarbeiter.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const sel = document.getElementById(
                              `sem-${sem.id}`
                            );
                            seminarZuweisen(sem, sel.value);
                            sel.value = "";
                          }}
                          style={{
                            ...saveBtnStyle,
                            marginTop: 0,
                            background:
                              "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                            padding: "0 20px",
                            boxShadow: "0 2px 8px rgba(139,92,246,0.3)",
                          }}
                        >
                          Zuweisen
                        </button>
                      </div>
                    )}
                    {assigned.length > 0 ? (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#e2e8f0",
                          background: "#0b1120",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #1e293b",
                        }}
                      >
                        <strong>Teilnehmer:</strong>
                        <br />
                        <span style={{ lineHeight: "1.6", color: "#94a3b8" }}>
                          {assigned.map((a) => a.mitarbeiter?.name).join(", ")}
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          fontStyle: "italic",
                        }}
                      >
                        Noch keine Teilnehmer.
                      </div>
                    )}
                  </div>
                );
              })}
              {seminare.length === 0 && (
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                  Keine Seminare geplant.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION RENDERER */}
      {toast.visible && (
        <div
          style={{
            position: "fixed",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "error" ? "#ef4444" : "#10b981",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            zIndex: 9999,
            fontWeight: "bold",
            fontSize: "14px",
            animation:
              "slideUpToast 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {toast.type === "success" ? "✅" : "⚠️"} {toast.message}
        </div>
      )}
    </div>
  );
}

// --- KALENDER KOMPONENTE (PREMIUM DESIGN OHNE EMOJIS) ---
function StudioKalenderKachel({
  studio,
  isAusserHaus,
  alleSchichten,
  alleMitarbeiter,
  ladeDaten,
  wochentage,
  attestNachtragen,
  canEdit,
  currentUnternehmenId,
  showToast,
}) {
  const meineSchichten = alleSchichten.filter((s) =>
    isAusserHaus ? s.studio_id === null : s.studio_id === studio.id
  );

  const [aktivesDatum, setAktivesDatum] = useState(null);
  const [schichtMitarbeiter, setSchichtMitarbeiter] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [schichtTyp, setSchichtTyp] = useState(
    isAusserHaus ? "Krank" : "Arbeit"
  );
  const [attestFile, setAttestFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  function getThemeColors(typ) {
    if (typ === "Urlaub")
      return {
        border: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.05)",
        text: "#fcd34d",
      };
    if (typ === "Seminar")
      return {
        border: "#8b5cf6",
        bg: "rgba(139, 92, 246, 0.05)",
        text: "#c4b5fd",
      };
    if (typ === "Schule/Uni")
      return {
        border: "#10b981",
        bg: "rgba(16, 185, 129, 0.05)",
        text: "#6ee7b7",
      };
    if (typ === "Krank")
      return {
        border: "#ef4444",
        bg: "rgba(239, 68, 68, 0.05)",
        text: "#fca5a5",
      };
    if (typ === "Feiertag")
      return {
        border: "#64748b",
        bg: "rgba(100, 116, 139, 0.05)",
        text: "#cbd5e1",
      };
    return {
      border: "#0ea5e9",
      bg: "rgba(14, 165, 233, 0.05)",
      text: "#7dd3fc",
    };
  }

  async function schichtLoeschen(id) {
    if (!window.confirm("Eintrag wirklich löschen?")) return;
    await supabase.from("schichten").delete().eq("id", id);
    ladeDaten();
    showToast("Eintrag gelöscht.", "success");
  }

  async function neueSchichtSpeichern(event) {
    event.preventDefault();
    if (!schichtMitarbeiter && schichtTyp !== "Feiertag")
      return showToast("Bitte wähle einen Mitarbeiter aus!", "error");

    setIsUploading(true);
    let hochgeladeneUrl = null;
    if (attestFile && schichtTyp === "Krank") {
      const fileExt = attestFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("atteste")
        .upload(fileName, attestFile);
      if (!uploadError) {
        const { data } = supabase.storage
          .from("atteste")
          .getPublicUrl(fileName);
        hochgeladeneUrl = data.publicUrl;
      }
    }

    const startStr = baueDatumZusammen(aktivesDatum, startTime);
    let endStr = baueDatumZusammen(aktivesDatum, endTime);
    const start = new Date(startStr);
    const ende = new Date(endStr);
    if (ende <= start) {
      ende.setDate(ende.getDate() + 1);
      endStr = baueDatumZusammen(ende, endTime);
    }

    if (schichtTyp !== "Feiertag" && schichtMitarbeiter) {
      const ueberschneidung = alleSchichten.some((s) => {
        if (
          s.mitarbeiter_id == schichtMitarbeiter &&
          s.status !== "Beantragt"
        ) {
          const existingStart = new Date(s.startzeit);
          const existingEnd = new Date(s.endzeit);
          return start < existingEnd && ende > existingStart;
        }
        return false;
      });
      if (ueberschneidung) {
        setIsUploading(false);
        return showToast(
          "Achtung: Doppelbuchung! Mitarbeiter ist da schon verplant.",
          "error"
        );
      }
    }

    await supabase.from("schichten").insert([
      {
        mitarbeiter_id: schichtMitarbeiter || null,
        studio_id: isAusserHaus ? null : studio.id,
        startzeit: startStr,
        endzeit: endStr,
        status: "Genehmigt",
        typ: schichtTyp,
        attest_url: hochgeladeneUrl,
        unternehmen_id: currentUnternehmenId,
      },
    ]);

    setIsUploading(false);
    setAktivesDatum(null);
    setAttestFile(null);
    ladeDaten();
    showToast("Schicht erfolgreich gespeichert.", "success");
  }

  return (
    <div
      style={{
        background: "#111827",
        padding: "25px",
        borderRadius: "16px",
        border: isAusserHaus ? "1px dashed #374151" : "1px solid #1e293b",
        marginBottom: "40px",
        position: "relative",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#f8fafc",
          fontSize: "18px",
          borderBottom: "1px solid #1e293b",
          paddingBottom: "15px",
        }}
      >
        {studio.name}
      </h2>

      {aktivesDatum && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(11, 17, 32, 0.85)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              background: "#111827",
              padding: "35px",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "400px",
              border: "1px solid #1e293b",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#f8fafc",
                fontSize: "16px",
                marginBottom: "25px",
              }}
            >
              Neuer Eintrag{" "}
              <span
                style={{
                  color: "#94a3b8",
                  fontWeight: "normal",
                  fontSize: "13px",
                  display: "block",
                  marginTop: "4px",
                }}
              >
                {aktivesDatum.toLocaleDateString("de-DE", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </span>
            </h3>
            <form
              onSubmit={neueSchichtSpeichern}
              style={{ display: "flex", flexDirection: "column", gap: "18px" }}
            >
              {isAusserHaus && (
                <div>
                  <label style={labelStyle}>Art der Abwesenheit</label>
                  <select
                    value={schichtTyp}
                    onChange={(e) => setSchichtTyp(e.target.value)}
                    style={inputStyle}
                  >
                    <option>Krank</option>
                    <option>Schule/Uni</option>
                    <option>Feiertag</option>
                    <option>Urlaub</option>
                  </select>
                </div>
              )}
              {schichtTyp !== "Feiertag" && (
                <div>
                  <label style={labelStyle}>Mitarbeiter</label>
                  <select
                    value={schichtMitarbeiter}
                    onChange={(e) => setSchichtMitarbeiter(e.target.value)}
                    required
                    style={inputStyle}
                  >
                    <option value="">-- Bitte wählen --</option>
                    {alleMitarbeiter.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Startzeit</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Endzeit</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              {schichtTyp === "Krank" && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.05)",
                    padding: "15px",
                    borderRadius: "8px",
                    border: "1px dashed #ef4444",
                  }}
                >
                  <label style={{ ...labelStyle, color: "#ef4444" }}>
                    AU-Bescheinigung
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setAttestFile(e.target.files[0])}
                    style={{
                      color: "#94a3b8",
                      fontSize: "13px",
                      marginTop: "5px",
                    }}
                  />
                </div>
              )}
              <div style={{ display: "flex", gap: "12px", marginTop: "15px" }}>
                <button
                  type="button"
                  onClick={() => setAktivesDatum(null)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "transparent",
                    color: "#94a3b8",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
                  }}
                >
                  {isUploading ? "Speichere..." : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "12px",
          marginTop: "20px",
          overflowX: "auto",
        }}
      >
        {wochentage.map((tag, index) => {
          const schichtenAnDemTag = meineSchichten.filter((s) => {
            const sStart = new Date(s.startzeit);
            const sEnde = new Date(s.endzeit);
            const tStart = new Date(tag);
            tStart.setHours(0, 0, 0, 0);
            const tEnde = new Date(tag);
            tEnde.setHours(23, 59, 59, 999);
            return sStart <= tEnde && sEnde >= tStart;
          });
          const isToday = tag.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              style={{
                background: "#0b1120",
                border: isToday ? "1px solid #0ea5e9" : "1px solid #1e293b",
                borderRadius: "12px",
                minHeight: "240px",
                display: "flex",
                flexDirection: "column",
                boxShadow: isToday
                  ? "0 0 15px rgba(14, 165, 233, 0.1)"
                  : "none",
              }}
            >
              <div
                style={{
                  background: isToday ? "rgba(14, 165, 233, 0.1)" : "#1f2937",
                  color: isToday ? "#0ea5e9" : "#f8fafc",
                  padding: "12px 10px",
                  textAlign: "center",
                  borderRadius: "11px 11px 0 0",
                  fontWeight: "bold",
                  borderBottom: isToday
                    ? "1px solid rgba(14, 165, 233, 0.2)"
                    : "1px solid #1e293b",
                }}
              >
                {tag.toLocaleDateString("de-DE", { weekday: "short" })}
                <br />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                    color: isToday ? "#38bdf8" : "#94a3b8",
                    display: "inline-block",
                    marginTop: "2px",
                  }}
                >
                  {tag.toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
              <div
                style={{
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  flex: 1,
                }}
              >
                {schichtenAnDemTag.map((s) => {
                  const theme = getThemeColors(s.typ);
                  return (
                    <div
                      key={s.id}
                      style={{
                        background: theme.bg,
                        padding: "12px",
                        borderRadius: "8px",
                        borderLeft: `3px solid ${theme.border}`,
                        borderTop: "1px solid #1e293b",
                        borderRight: "1px solid #1e293b",
                        borderBottom: "1px solid #1e293b",
                        position: "relative",
                      }}
                    >
                      {s.typ !== "Arbeit" && (
                        <div
                          style={{
                            fontSize: "9px",
                            background: theme.border,
                            color: "#fff",
                            display: "inline-block",
                            padding: "3px 6px",
                            borderRadius: "4px",
                            marginBottom: "6px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {s.typ}
                        </div>
                      )}
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "#f8fafc",
                          fontSize: "13px",
                        }}
                      >
                        {new Date(s.startzeit).toLocaleTimeString("de-DE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(s.endzeit).toLocaleTimeString("de-DE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div
                        style={{
                          color: theme.text,
                          fontWeight: "bold",
                          marginTop: "4px",
                          fontSize: "13px",
                        }}
                      >
                        {s.mitarbeiter?.name || "Alle"}
                      </div>

                      {s.typ === "Krank" &&
                        (s.attest_url ? (
                          <a
                            href={s.attest_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "block",
                              marginTop: "10px",
                              fontSize: "11px",
                              color: "#10b981",
                              textDecoration: "none",
                              background: "rgba(16, 185, 129, 0.1)",
                              padding: "6px",
                              borderRadius: "6px",
                              textAlign: "center",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                            }}
                          >
                            Attest ansehen
                          </a>
                        ) : (
                          <div
                            style={{
                              display: "block",
                              marginTop: "10px",
                              fontSize: "11px",
                              color: "#f59e0b",
                              background: "rgba(245, 158, 11, 0.1)",
                              padding: "8px",
                              borderRadius: "6px",
                              textAlign: "center",
                              border: "1px dashed rgba(245, 158, 11, 0.3)",
                            }}
                          >
                            Attest fehlt
                            {canEdit && (
                              <label
                                style={{
                                  display: "block",
                                  marginTop: "8px",
                                  background: "#f59e0b",
                                  color: "#000",
                                  padding: "6px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }}
                              >
                                Hochladen
                                <input
                                  type="file"
                                  accept=".pdf,image/*"
                                  hidden
                                  onChange={(e) => attestNachtragen(e, s.id)}
                                />
                              </label>
                            )}
                          </div>
                        ))}
                      {canEdit && (
                        <button
                          onClick={() => schichtLoeschen(s.id)}
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "11px",
                            color: "#ef4444",
                            opacity: 0.6,
                            transition: "0.2s",
                            fontWeight: "bold",
                          }}
                          onMouseOver={(e) => (e.target.style.opacity = 1)}
                          onMouseOut={(e) => (e.target.style.opacity = 0.6)}
                        >
                          X
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {canEdit && (
                <button
                  onClick={() => {
                    setAktivesDatum(tag);
                    setSchichtMitarbeiter("");
                    setStartTime("08:00");
                    setEndTime("16:00");
                    setSchichtTyp(isAusserHaus ? "Krank" : "Arbeit");
                    setAttestFile(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "transparent",
                    border: "none",
                    borderTop: "1px solid #1e293b",
                    borderRadius: "0 0 11px 11px",
                    cursor: "pointer",
                    color: isAusserHaus ? "#64748b" : "#0ea5e9",
                    fontSize: "12px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    transition: "0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = isAusserHaus
                      ? "rgba(100, 116, 139, 0.1)"
                      : "rgba(14, 165, 233, 0.1)";
                  }}
                  onMouseOut={(e) =>
                    (e.target.style.background = "transparent")
                  }
                >
                  + Hinzufügen
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- GLOBALE ZENTRIO STYLES ---
const labelStyle = {
  display: "block",
  fontSize: "11px",
  color: "#94a3b8",
  marginBottom: "6px",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const inputStyle = {
  padding: "12px 15px",
  background: "#1f2937",
  color: "#f8fafc",
  border: "1px solid #374151",
  borderRadius: "8px",
  width: "100%",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none",
  transition: "border 0.2s, box-shadow 0.2s",
};
const btnStyle = {
  cursor: "pointer",
  padding: "10px 18px",
  background: "#1f2937",
  border: "1px solid #374151",
  borderRadius: "8px",
  fontWeight: "bold",
  color: "#f8fafc",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
};
const saveBtnStyle = {
  cursor: "pointer",
  padding: "14px",
  background: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  marginTop: "5px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  boxShadow: "0 4px 12px rgba(14, 165, 233, 0.25)",
  transition: "all 0.2s",
  fontSize: "12px",
};
const textBtnStyle = {
  cursor: "pointer",
  background: "transparent",
  border: "1px solid #374151",
  fontSize: "12px",
  padding: "6px 12px",
  color: "#94a3b8",
  borderRadius: "6px",
  transition: "0.2s",
  fontWeight: "bold",
};
const iconBtnStyle = {
  cursor: "pointer",
  background: "none",
  border: "none",
  fontSize: "12px",
  padding: "6px",
  color: "#ef4444",
  transition: "0.2s",
  fontWeight: "bold",
};
const tabStyle = (isActive, activeColor = "#0ea5e9") => ({
  cursor: "pointer",
  padding: "10px 18px",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  background: isActive ? `rgba(${hexToRgb(activeColor)}, 0.1)` : "transparent",
  color: isActive ? activeColor : "#94a3b8",
  border: isActive ? `1px solid ${activeColor}` : "1px solid transparent",
  borderRadius: "8px",
  transition: "all 0.2s",
});
const thStyle = {
  padding: "15px 20px",
  color: "#94a3b8",
  fontWeight: "bold",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  borderBottom: "1px solid #374151",
};
const tdStyle = { padding: "15px 20px", color: "#f8fafc", fontSize: "14px" };

// Helper für transparente Tab-Farben
function hexToRgb(hex) {
  if (hex === "#ef4444") return "239, 68, 68";
  if (hex === "#10b981") return "16, 185, 129";
  if (hex === "#8b5cf6") return "139, 92, 246";
  if (hex === "#f59e0b") return "245, 158, 11";
  if (hex === "#6366f1") return "99, 102, 241";
  return "14, 165, 233"; // Default Cyan
}
