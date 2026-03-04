import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const supabaseUrl = "https://vodcrfucambrhkjahgjc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGNyZnVjYW1icmhramFoZ2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjgyMTEsImV4cCI6MjA4NzcwNDIxMX0.XuAhDtqN7mKPQnFnM9qyY226Lf9sJdTthRZLL2PucT4";
const supabase = createClient(supabaseUrl, supabaseKey);

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

function getMitarbeiterColor(name) {
  if (!name) return "#94a3b8";
  const colors = [
    "#f87171",
    "#fb923c",
    "#fbbf24",
    "#a3e635",
    "#34d399",
    "#2dd4bf",
    "#22d3ee",
    "#38bdf8",
    "#818cf8",
    "#a78bfa",
    "#e879f9",
    "#f43f5e",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

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
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    visible: false,
  });

  const [userProfiles, setUserProfiles] = useState([]);
  const [activeUnternehmenId, setActiveUnternehmenId] = useState(null);
  const [alleUnternehmen, setAlleUnternehmen] = useState([]);

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

  const [editingMitarbeiterId, setEditingMitarbeiterId] = useState(null);
  const [editMitarbeiterName, setEditMitarbeiterName] = useState("");
  const [editMitarbeiterEmail, setEditMitarbeiterEmail] = useState("");
  const [editMitarbeiterStunden, setEditMitarbeiterStunden] = useState("");
  const [editMitarbeiterUrlaub, setEditMitarbeiterUrlaub] = useState("");
  const [editMitarbeiterRolle, setEditMitarbeiterRolle] = useState("");
  const [editMitarbeiterFreigabe, setEditMitarbeiterFreigabe] = useState(false);

  // Seminar Multi-Select State
  const [selectedSeminarMembers, setSelectedSeminarMembers] = useState({});

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

  function showToast(message, type = "success") {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3500);
  }

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

  async function handleAuth(e) {
    e.preventDefault();
    setIsLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) showToast(error.message, "error");
      else {
        showToast("Fast geschafft! Bitte Postfach checken.", "success");
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
    const email = prompt("E-Mail für Reset:");
    if (email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) showToast(error.message, "error");
      else showToast("Link gesendet.", "success");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

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
    await supabase
      .from("mitarbeiter")
      .insert([
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
    showToast("Mandant angelegt.", "success");
  }

  async function godDeleteCompany(id) {
    if (!window.confirm("Mandant unwiderruflich löschen?")) return;
    await supabase.from("schichten").delete().eq("unternehmen_id", id);
    await supabase.from("seminare").delete().eq("unternehmen_id", id);
    await supabase.from("studios").delete().eq("unternehmen_id", id);
    await supabase.from("mitarbeiter").delete().eq("unternehmen_id", id);
    await supabase.from("unternehmen").delete().eq("id", id);
    ladeSystemDaten();
    showToast("Gelöscht.", "success");
  }

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
    const ms = schichten.filter(
      (s) =>
        s.mitarbeiter_id === mId &&
        s.typ === typ &&
        s.status === "Genehmigt" &&
        new Date(s.startzeit).getFullYear() === new Date().getFullYear()
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
    if (start >= ende) return showToast("Ende nach Start!", "error");
    await supabase
      .from("schichten")
      .insert([
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
    showToast("Eingetragen.", "success");
  }

  async function urlaubBeantragen(e) {
    e.preventDefault();
    const start = new Date(urlaubStart + "T00:00:00");
    const ende = new Date(urlaubEnde + "T23:59:59");
    if (start > ende) return showToast("Ende nach Start!", "error");
    await supabase
      .from("schichten")
      .insert([
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
    showToast("Beantragt.", "success");
  }

  async function seminarSpeichern(e) {
    e.preventDefault();
    await supabase
      .from("seminare")
      .insert([
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
    showToast("Geplant.", "success");
  }

  async function seminarMultiZuweisen(sem) {
    const ids = selectedSeminarMembers[sem.id] || [];
    if (ids.length === 0) return showToast("Niemand gewählt!", "error");
    const newShifts = ids.map((id) => ({
      mitarbeiter_id: id,
      startzeit: sem.startzeit,
      endzeit: sem.endzeit,
      typ: "Seminar",
      status: "Genehmigt",
      unternehmen_id: activeUnternehmenId,
    }));
    await supabase.from("schichten").insert(newShifts);
    setSelectedSeminarMembers((prev) => ({ ...prev, [sem.id]: [] }));
    ladeDaten();
    showToast(`${ids.length} Personen zugewiesen.`, "success");
  }

  async function schichtLoeschen(id) {
    if (!window.confirm("Löschen?")) return;
    await supabase.from("schichten").delete().eq("id", id);
    ladeDaten();
    showToast("Entfernt.", "success");
  }

  async function mitarbeiterSpeichern(e) {
    e.preventDefault();
    await supabase
      .from("mitarbeiter")
      .insert([
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
    showToast("Hinzugefügt.", "success");
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
    showToast("Gespeichert.", "success");
  }

  async function studioSpeichern(e) {
    e.preventDefault();
    await supabase
      .from("studios")
      .insert([{ name: neuesStudioName, unternehmen_id: activeUnternehmenId }]);
    ladeDaten();
    setNeuesStudioName("");
    showToast("Studio angelegt.", "success");
  }

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
            Management Platform
          </p>
          <form
            onSubmit={handleAuth}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="email"
              placeholder="E-Mail"
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
              {isSignUp ? "Aktivieren" : "Login"}
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
              {isSignUp ? "Login" : "Registrieren"}
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
            }}
          >
            {toast.type === "success" ? "✅" : "⚠️"} {toast.message}
          </div>
        )}
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
        maxWidth: "1600px",
      }}
    >
      <style>{`
        @media print {
          @page { size: landscape; margin: 8mm; }
          body, .App { background: white !important; color: black !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .print-header-box { display: flex !important; background: transparent !important; border-bottom: 2px solid #000 !important; border-radius: 0 !important; padding: 0 0 10px 0 !important; margin-bottom: 10px !important; }
          .print-header-box h2 { font-size: 16px !important; color: #000 !important; font-weight: bold !important; margin: 0 !important; }
          .print-bg-white { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; margin-bottom: 20px !important; page-break-inside: avoid !important; }
          h2.print-text-dark { color: #000 !important; font-size: 16px !important; border-bottom: 1px solid #ccc !important; padding-bottom: 5px !important; margin-bottom: 10px !important; }
          .print-grid { display: grid !important; grid-template-columns: repeat(7, 1fr) !important; gap: 4px !important; width: 100% !important; border: none !important; }
          .print-day { background: #fff !important; border: 1px solid #000 !important; min-height: 120px !important; display: block !important; border-radius: 0 !important; }
          .print-day-header { background: #e2e8f0 !important; color: #000 !important; border-bottom: 1px solid #000 !important; padding: 4px !important; font-size: 12px !important; text-align: center !important; font-weight: bold !important; }
          .print-day-header span { color: #333 !important; font-size: 10px !important; display: block !important; margin-top: 2px !important; }
          .print-shift-container { padding: 4px !important; display: block !important; }
          .print-shift { display: block !important; margin-bottom: 4px !important; padding: 5px !important; border: 1px solid #ccc !important; border-left: 4px solid #000 !important; background: #f9f9f9 !important; page-break-inside: avoid !important; }
          .print-shift-time { font-size: 10px !important; color: #000 !important; font-weight: normal !important; display: block !important; }
          .print-shift-name { font-size: 11px !important; color: #000 !important; font-weight: bold !important; display: block !important; margin-top: 2px !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <header
        className="no-print"
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
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
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
              </strong>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isGod && !activeUnternehmenId && (
            <button style={tabStyle(true, "#ef4444")}>System Zentrale</button>
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
              Zur Zentrale
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
          <button
            onClick={handleLogout}
            style={{
              marginLeft: "15px",
              color: "#ef4444",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Abmelden
          </button>
        </div>
      </header>

      {activeUnternehmenId && (
        <div
          className="print-header-box"
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
          }}
        >
          <button
            className="no-print"
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
            className="print-text-dark"
            style={{ margin: 0, fontSize: "16px", color: "#94a3b8" }}
          >
            Woche:{" "}
            <strong className="print-text-dark" style={{ color: "#f8fafc" }}>
              {wochenStart.toLocaleDateString()} -{" "}
              {wochenEnde.toLocaleDateString()}
            </strong>
          </h2>
          <button
            className="no-print"
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

      {/* SYSTEM ZENTRALE (INFOS VOLLSTÄNDIG) */}
      {aktiverTab === "system" && isGod && !activeUnternehmenId && (
        <div className="no-print">
          <div
            style={{
              background: "linear-gradient(145deg, #111827, #0b1120)",
              padding: "30px",
              borderRadius: "16px",
              border: "1px solid #1e293b",
              borderTop: "2px solid #ef4444",
              marginBottom: "40px",
            }}
          >
            <h3 style={{ marginTop: 0, textAlign: "center", color: "#f8fafc" }}>
              Neuen Mandanten anlegen
            </h3>
            <form
              onSubmit={godCreateAndAssign}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                style={{
                  ...saveBtnStyle,
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  height: "48px",
                  marginTop: "24px",
                }}
              >
                Gründen
              </button>
            </form>
          </div>
          <h2
            style={{
              color: "#f8fafc",
              borderBottom: "1px solid #1e293b",
              paddingBottom: "15px",
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
                }}
              >
                <h3 style={{ margin: "0 0 15px 0", color: "#0ea5e9" }}>
                  {u.name}
                </h3>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    lineHeight: "1.8",
                    marginBottom: "20px",
                    background: "#0b1120",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                >
                  Sitz: <span style={{ color: "#fff" }}>{u.sitz || "-"}</span>
                  <br />
                  GF:{" "}
                  <span style={{ color: "#fff" }}>
                    {u.geschaeftsfuehrer || "-"}
                  </span>
                  <br />
                  Studios:{" "}
                  <span style={{ color: "#fff" }}>
                    {u.studios?.length || 0}
                  </span>{" "}
                  | Team:{" "}
                  <span style={{ color: "#fff" }}>
                    {u.mitarbeiter?.length || 0}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      setActiveUnternehmenId(u.id);
                      setAktiverTab("mein_unternehmen");
                    }}
                    style={{ ...saveBtnStyle, flex: 1, boxShadow: "none" }}
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

      {/* DIENSTPLAN */}
      {aktiverTab === "dienstplan" && activeUnternehmenId && (
        <div>
          <div
            className="no-print"
            style={{
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              marginBottom: "35px",
              paddingBottom: "10px",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setAktivesStudioView("all")}
              style={{
                ...btnStyle,
                background: aktivesStudioView === "all" ? "#0ea5e9" : "#111827",
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
                  background:
                    aktivesStudioView === s.id.toString()
                      ? "#0ea5e9"
                      : "#111827",
                }}
              >
                {s.name}
              </button>
            ))}
            <button
              onClick={() => window.print()}
              style={{
                ...btnStyle,
                marginLeft: "auto",
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
              }}
            >
              🖨️ PDF / Drucken
            </button>
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

      {/* SEMINARE (MIT MULTI-SELECT) */}
      {aktiverTab === "seminare" && activeUnternehmenId && (
        <div
          className="no-print"
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
              }}
            >
              <h3 style={{ marginTop: 0, color: "#8b5cf6" }}>Neues Seminar</h3>
              <form
                onSubmit={seminarSpeichern}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <div>
                  <label style={labelStyle}>Thema</label>
                  <input
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
                  }}
                >
                  Seminar planen
                </button>
              </form>
            </div>
          )}
          <div style={{ flex: "1 1 500px" }}>
            <h3 style={{ marginTop: 0 }}>Aktuelle Seminare</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
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
                      padding: "20px",
                      borderRadius: "12px",
                      borderLeft: "4px solid #8b5cf6",
                      flex: "1 1 400px",
                      border: "1px solid #1e293b",
                    }}
                  >
                    <h4 style={{ margin: 0 }}>{sem.titel}</h4>
                    <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {new Date(sem.startzeit).toLocaleString("de-DE")} -{" "}
                      {new Date(sem.endzeit).toLocaleTimeString("de-DE")} Uhr
                    </p>

                    {isAdmin && (
                      <div
                        style={{
                          marginTop: "15px",
                          borderTop: "1px solid #1e293b",
                          paddingTop: "15px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            marginBottom: "8px",
                          }}
                        >
                          Teilnehmer wählen:
                        </p>
                        <div
                          style={{
                            maxHeight: "150px",
                            overflowY: "auto",
                            background: "#0b1120",
                            padding: "10px",
                            borderRadius: "8px",
                          }}
                        >
                          {mitarbeiter.map((m) => (
                            <label
                              key={m.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "4px 0",
                                cursor: "pointer",
                                fontSize: "13px",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={(
                                  selectedSeminarMembers[sem.id] || []
                                ).includes(m.id)}
                                onChange={(e) => {
                                  const current =
                                    selectedSeminarMembers[sem.id] || [];
                                  setSelectedSeminarMembers({
                                    ...selectedSeminarMembers,
                                    [sem.id]: e.target.checked
                                      ? [...current, m.id]
                                      : current.filter((id) => id !== m.id),
                                  });
                                }}
                              />{" "}
                              {m.name}
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={() => seminarMultiZuweisen(sem)}
                          style={{
                            ...saveBtnStyle,
                            width: "100%",
                            marginTop: "10px",
                            background: "#8b5cf6",
                          }}
                        >
                          Alle Gewählten zuweisen
                        </button>
                      </div>
                    )}
                    <div
                      style={{
                        marginTop: "15px",
                        fontSize: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      <strong>Eingeteilt:</strong>{" "}
                      {assigned.map((a) => a.mitarbeiter?.name).join(", ") ||
                        "Niemand"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {aktiverTab === "mein_unternehmen" && activeUnternehmenId && isAdmin && (
        <div className="no-print">
          {/* Verwaltung hier... (wie oben beschrieben) */}
        </div>
      )}

      {toast.visible && (
        <div
          className="no-print"
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
          }}
        >
          {toast.type === "success" ? "✅" : "⚠️"} {toast.message}
        </div>
      )}
    </div>
  );
}

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

  function getThemeColors(typ, mColor) {
    if (typ === "Urlaub")
      return {
        border: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.08)",
        text: "#fcd34d",
        borderSoft: "rgba(245, 158, 11, 0.2)",
      };
    if (typ === "Seminar")
      return {
        border: "#8b5cf6",
        bg: "rgba(139, 92, 246, 0.08)",
        text: "#c4b5fd",
        borderSoft: "rgba(139, 92, 246, 0.2)",
      };
    if (typ === "Schule/Uni")
      return {
        border: "#10b981",
        bg: "rgba(16, 185, 129, 0.08)",
        text: "#6ee7b7",
        borderSoft: "rgba(16, 185, 129, 0.2)",
      };
    if (typ === "Krank")
      return {
        border: "#ef4444",
        bg: "rgba(239, 68, 68, 0.08)",
        text: "#fca5a5",
        borderSoft: "rgba(239, 68, 68, 0.2)",
      };
    return {
      border: mColor,
      bg: `${mColor}1A`,
      text: mColor,
      borderSoft: `${mColor}33`,
    };
  }

  async function schichtLoeschen(id) {
    if (!window.confirm("Löschen?")) return;
    await supabase.from("schichten").delete().eq("id", id);
    ladeDaten();
    showToast("Entfernt.", "success");
  }

  async function neueSchichtSpeichern(event) {
    event.preventDefault();
    if (!schichtMitarbeiter && schichtTyp !== "Feiertag")
      return showToast("Wähle Mitarbeiter!", "error");
    const startStr = baueDatumZusammen(aktivesDatum, startTime);
    let endStr = baueDatumZusammen(aktivesDatum, endTime);
    await supabase
      .from("schichten")
      .insert([
        {
          mitarbeiter_id: schichtMitarbeiter || null,
          studio_id: isAusserHaus ? null : studio.id,
          startzeit: startStr,
          endzeit: endStr,
          status: "Genehmigt",
          typ: schichtTyp,
          unternehmen_id: currentUnternehmenId,
        },
      ]);
    setAktivesDatum(null);
    ladeDaten();
    showToast("Gespeichert.", "success");
  }

  return (
    <div
      className="print-bg-white"
      style={{
        background: "#111827",
        padding: "25px",
        borderRadius: "16px",
        border: isAusserHaus ? "1px dashed #374151" : "1px solid #1e293b",
        marginBottom: "40px",
        position: "relative",
      }}
    >
      <h2
        className="print-text-dark"
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
          className="no-print"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(11,17,32,0.85)",
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
              padding: "30px",
              borderRadius: "16px",
              width: "400px",
              border: "1px solid #1e293b",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#f8fafc" }}>Neuer Eintrag</h3>
            <form
              onSubmit={neueSchichtSpeichern}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {isAusserHaus && (
                <div>
                  <label style={labelStyle}>Art</label>
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
              <div>
                <label style={labelStyle}>Mitarbeiter</label>
                <select
                  value={schichtMitarbeiter}
                  onChange={(e) => setSchichtMitarbeiter(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">-- Wählen --</option>
                  {alleMitarbeiter.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Von</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Bis</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setAktivesDatum(null)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "transparent",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, ...saveBtnStyle, marginTop: 0 }}
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div
        className="print-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(240px, 1fr))",
          gap: "12px",
          marginTop: "20px",
          overflowX: "auto",
        }}
      >
        {wochentage.map((tag, index) => {
          const schichtenAnDemTag = meineSchichten
            .filter((s) => {
              if (!s.startzeit || !s.endzeit) return false;
              const sStart = new Date(s.startzeit);
              const sEnde = new Date(s.endzeit);
              const tStart = new Date(tag);
              tStart.setHours(0, 0, 0, 0);
              const tEnde = new Date(tag);
              tEnde.setHours(23, 59, 59, 999);
              return sStart <= tEnde && sEnde >= tStart;
            })
            .sort((a, b) => new Date(a.startzeit) - new Date(b.startzeit));

          const overlappingGroups = [];
          if (schichtenAnDemTag.length > 0) {
            let currentGroup = [schichtenAnDemTag[0]];
            let currentGroupEnd =
              new Date(schichtenAnDemTag[0].endzeit).getTime() || 0;
            for (let i = 1; i < schichtenAnDemTag.length; i++) {
              const start =
                new Date(schichtenAnDemTag[i].startzeit).getTime() || 0;
              if (start < currentGroupEnd) {
                currentGroup.push(schichtenAnDemTag[i]);
                currentGroupEnd = Math.max(
                  currentGroupEnd,
                  new Date(schichtenAnDemTag[i].endzeit).getTime() || 0
                );
              } else {
                overlappingGroups.push(currentGroup);
                currentGroup = [schichtenAnDemTag[i]];
                currentGroupEnd =
                  new Date(schichtenAnDemTag[i].endzeit).getTime() || 0;
              }
            }
            overlappingGroups.push(currentGroup);
          }

          return (
            <div
              key={index}
              className="print-day"
              style={{
                background: "#0b1120",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                minHeight: "240px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                className="print-day-header"
                style={{
                  background: "#1f2937",
                  color: "#fff",
                  padding: "10px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {tag.toLocaleDateString("de-DE", { weekday: "short" })}
                <br />
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                  {tag.toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
              <div
                className="print-shift-container"
                style={{ padding: "10px", flex: 1 }}
              >
                {overlappingGroups.map((group, gIndex) => (
                  <div
                    key={gIndex}
                    className="print-shift-row"
                    style={{ display: "flex", gap: "6px", width: "100%" }}
                  >
                    {group.map((s) => {
                      const mColor = getMitarbeiterColor(s.mitarbeiter?.name);
                      const theme = getThemeColors(s.typ, mColor);
                      const groupStart = Math.min(
                        ...group.map(
                          (sh) => new Date(sh.startzeit).getTime() || 0
                        )
                      );
                      const offsetMinutes =
                        Math.max(
                          0,
                          ((new Date(s.startzeit).getTime() || 0) -
                            groupStart) /
                            60000
                        ) || 0;
                      const durationMinutes =
                        Math.max(
                          0,
                          ((new Date(s.endzeit).getTime() || 0) -
                            (new Date(s.startzeit).getTime() || 0)) /
                            60000
                        ) || 0;
                      return (
                        <div
                          key={s.id}
                          className="print-shift"
                          style={{
                            flex: 1,
                            marginTop: `${offsetMinutes * 0.8}px`,
                            minHeight: `${Math.max(
                              60,
                              durationMinutes * 0.8
                            )}px`,
                            background: theme.bg,
                            padding: "8px",
                            borderRadius: "6px",
                            borderLeft: `4px solid ${theme.border}`,
                            borderTop: `1px solid ${theme.borderSoft}`,
                            borderRight: `1px solid ${theme.borderSoft}`,
                            borderBottom: `1px solid ${theme.borderSoft}`,
                            position: "relative",
                            minWidth: 0,
                          }}
                        >
                          <div
                            className="print-shift-time"
                            style={{
                              fontWeight: "bold",
                              fontSize: "10px",
                              color: "#f8fafc",
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
                            className="print-shift-name"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              color: theme.text,
                              fontWeight: "bold",
                              marginTop: "4px",
                              fontSize: "11px",
                            }}
                          >
                            <div
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                backgroundColor: mColor,
                              }}
                            ></div>
                            {s.mitarbeiter?.name || "Alle"}
                          </div>
                          {canEdit && (
                            <button
                              className="no-print"
                              onClick={() => schichtLoeschen(s.id)}
                              style={{
                                position: "absolute",
                                top: "2px",
                                right: "2px",
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                fontSize: "10px",
                                cursor: "pointer",
                              }}
                            >
                              X
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              {canEdit && (
                <button
                  className="no-print"
                  onClick={() => setAktivesDatum(tag)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "transparent",
                    border: "none",
                    borderTop: "1px solid #1e293b",
                    color: "#0ea5e9",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  + HINZUFÜGEN
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "11px",
  color: "#94a3b8",
  marginBottom: "6px",
  fontWeight: "bold",
  textTransform: "uppercase",
};
const inputStyle = {
  padding: "12px",
  background: "#1f2937",
  color: "#f8fafc",
  border: "1px solid #374151",
  borderRadius: "8px",
  width: "100%",
  boxSizing: "border-box",
};
const btnStyle = {
  cursor: "pointer",
  padding: "10px 18px",
  background: "#1f2937",
  border: "1px solid #374151",
  borderRadius: "8px",
  fontWeight: "bold",
  color: "#fff",
};
const saveBtnStyle = {
  cursor: "pointer",
  padding: "14px",
  background: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
};
const textBtnStyle = {
  cursor: "pointer",
  background: "transparent",
  border: "1px solid #374151",
  fontSize: "12px",
  padding: "6px 12px",
  color: "#94a3b8",
  borderRadius: "6px",
};
const tabStyle = (isActive, color = "#0ea5e9") => ({
  cursor: "pointer",
  padding: "10px 18px",
  fontSize: "12px",
  fontWeight: "bold",
  background: isActive ? `${color}20` : "transparent",
  color: isActive ? color : "#94a3b8",
  border: isActive ? `1px solid ${color}` : "1px solid transparent",
  borderRadius: "8px",
});
const thStyle = {
  padding: "15px 20px",
  color: "#94a3b8",
  fontWeight: "bold",
  fontSize: "11px",
  borderBottom: "1px solid #374151",
};
const tdStyle = { padding: "15px 20px", color: "#f8fafc", fontSize: "14px" };
