import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";


import ren1 from "./assets/styles/renaissance/ren1.jpg";
import ren2 from "./assets/styles/renaissance/ren2.jpg";
import ren3 from "./assets/styles/renaissance/ren3.jpg";

import bar1 from "./assets/styles/baroque/bar1.jpg";
import bar2 from "./assets/styles/baroque/bar2.jpg";
import bar3 from "./assets/styles/baroque/bar3.jpg";

import rom1 from "./assets/styles/romanticism/rom1.jpg";
import rom2 from "./assets/styles/romanticism/rom2.jpg";
import rom3 from "./assets/styles/romanticism/rom3.jpg";

import imp1 from "./assets/styles/impressionism/imp1.jpg";
import imp2 from "./assets/styles/impressionism/imp2.jpg";
import imp3 from "./assets/styles/impressionism/imp3.jpg";

import mod1 from "./assets/styles/modern/mod1.jpg";
import mod2 from "./assets/styles/modern/mod2.jpg";
import mod3 from "./assets/styles/modern/mod3.jpg";

import audio from "./assets/audio/lofi.mp3";

import ana1 from "./assets/anatomy/ana1.jpg";
import ana2 from "./assets/anatomy/ana2.jpg";

import col1 from "./assets/color/col1.jpg";

import lig1 from "./assets/lighting/lig1.jpg";

const COLOR_IMAGES = [col1];

const LIGHTING_IMAGES = [lig1];

const ANATOMY_IMAGES = [ana1, ana2];

const STYLE_OPTIONS = [
  { key: "none", name: "None" },
  { key: "renaissance", name: "Renaissance" },
  { key: "baroque", name: "Baroque" },
  { key: "romanticism", name: "Romanticism" },
  { key: "impressionism", name: "Impressionism" },
  { key: "modern", name: "Modern Art" },
];

const STYLE_IMAGES = {
  renaissance: [ren1, ren2, ren3],
  baroque: [bar1, bar2, bar3],
  romanticism: [rom1, rom2, rom3],
  impressionism: [imp1, imp2, imp3],
  modern: [mod1, mod2, mod3],
};



const MEDIUMS = ["Watercolor", "Acrylic", "Digital", "Sketch", "Ink", "Other"];
const VIBES = ["Cozy", "Dreamy", "Dramatic", "Soft", "Moody", "Bright", "Minimal"];
const DURATIONS = [10, 20, 30, 45, 60];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function newId() {
  return crypto.randomUUID();
}

export default function App() {

  const REFERENCE_TYPES = [
  { key: "none", name: "None" },
  { key: "styles", name: "Art Styles" },
  { key: "anatomy", name: "Anatomy" },
  { key: "color", name: "Color" },
  { key: "lighting", name: "Lighting" },
];

const [refType, setRefType] = useState("none");

  const [styleKey, setStyleKey] = useState("none");
  const styleImages = STYLE_IMAGES[styleKey] ?? [];
  
const audioRef = useRef(null);
const [audioOn, setAudioOn] = useState(false);
const [volume, setVolume] = useState(0.35);

useEffect(() => {
  const a = audioRef.current;
  if (!a) return;
  a.volume = volume;
}, [volume]);

useEffect(() => {
  const a = audioRef.current;
  if (!a) return;
  if (audioOn) a.play().catch(() => {});
  else a.pause();
}, [audioOn]);


  

  

  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem("artjam.sessions");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("artjam.sessions", JSON.stringify(sessions));
  }, [sessions]);


  const [title, setTitle] = useState("");
  const [medium, setMedium] = useState(MEDIUMS[0]);
  const [durationMin, setDurationMin] = useState(30);
  const [selectedVibes, setSelectedVibes] = useState([]);


  const [activeId, setActiveId] = useState(null);
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId]
  );


  const [query, setQuery] = useState("");
  const [filterMedium, setFilterMedium] = useState("All");
  const [filterVibe, setFilterVibe] = useState("All");

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.vibes.join(" ").toLowerCase().includes(q);

      const matchesMedium = filterMedium === "All" || s.medium === filterMedium;
      const matchesVibe = filterVibe === "All" || s.vibes.includes(filterVibe);

      return matchesQuery && matchesMedium && matchesVibe;
    });
  }, [sessions, query, filterMedium, filterVibe]);


  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);


  useEffect(() => {
    setRunning(false);
    setSecondsLeft(activeSession ? activeSession.durationMin * 60 : 0);
  }, [activeId]);
  

  useEffect(() => {
    if (!running) return;
    if (!activeSession) return;
    if (secondsLeft <= 0) return;

    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [running, secondsLeft, activeSession]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  function toggleVibe(v) {
    setSelectedVibes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function createSession(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    const session = {
      id: newId(),
      title: t,
      medium,
      durationMin: clamp(Number(durationMin) || 30, 5, 180),
      vibes: selectedVibes.length ? selectedVibes : ["Freeform"],
      checklist: [
        { key: "sketch", label: "Sketch / thumbnail", done: false },
        { key: "base", label: "Big shapes / first wash", done: false },
        { key: "values", label: "Shadows / values", done: false },
        { key: "details", label: "Details", done: false },
        { key: "finish", label: "Final touches", done: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSessions((s) => [session, ...s]);
    setTitle("");
    setSelectedVibes([]);
    setActiveId(session.id);
  }

  function deleteSession(id) {
    if (activeId === id) setActiveId(null);
    setSessions((s) => s.filter((x) => x.id !== id));
  }

  function toggleChecklistItem(itemKey) {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession.id) return s;
        return {
          ...s,
          checklist: s.checklist.map((it) =>
            it.key === itemKey ? { ...it, done: !it.done } : it
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  function resetTimer() {
    if (!activeSession) return;
    setRunning(false);
    setSecondsLeft(activeSession.durationMin * 60);
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>ArtJam</h1>
          <p className="sub">
            Plan quick art sessions
          </p>
        </div>

      </header>

      <div className="grid">
        <section className="card">
          <h2>Create a session</h2>

          <form className="form" onSubmit={createSession}>
            <label>
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g., "Rainy cafe window"'
              />
            </label>

            <div className="row">
              <label>
                Medium
                <select value={medium} onChange={(e) => setMedium(e.target.value)}>
                  {MEDIUMS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Duration
                <select
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} min
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="vibes">
              <div className="label">Tags</div>
              <div className="chips">
                {VIBES.map((v) => (
                  <button
                    type="button"
                    key={v}
                    className={selectedVibes.includes(v) ? "chip chipOn" : "chip"}
                    onClick={() => toggleVibe(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <button className="btnWide" type="submit">
              Create
            </button>
          </form>
        </section>

        <section className="card">
          <div className="cardHeader">
            <h2>Sessions</h2>
            <div className="muted">{sessions.length} total</div>
          </div>

          <div className="filters">
            <input
              className="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or tags..."
            />

            <select value={filterMedium} onChange={(e) => setFilterMedium(e.target.value)}>
              <option value="All">All media</option>
              {MEDIUMS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select value={filterVibe} onChange={(e) => setFilterVibe(e.target.value)}>
              <option value="All">All vibes</option>
              {VIBES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
              <option value="Freeform">Freeform</option>
            </select>
          </div>

          <div className="list">
            {filteredSessions.length === 0 ? (
              <p className="muted">No sessions yet — create one!</p>
            ) : (
              filteredSessions.map((s) => (
                <div
                  key={s.id}
                  className={activeId === s.id ? "listItem listItemOn" : "listItem"}
                  onClick={() => setActiveId(s.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="listTop">
                    <div>
                      <div className="listTitle">{s.title}</div>
                      <div className="listMeta">
                        {s.medium} • {s.durationMin} min • {new Date(s.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      className="x"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(s.id);
                      }}
                      aria-label="Delete"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="chipRow">
                    {s.vibes.map((v) => (
                      <span className="tag" key={v}>
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card wide">
          <div className="cardHeader">
            <h2>Active session</h2>
            {activeSession ? (
              <div className="muted">
                Last updated: {new Date(activeSession.updatedAt).toLocaleString()}
              </div>
            ) : (
              <div className="muted">Select a session</div>
            )}
          </div>

          {!activeSession ? (
            <p className="muted">
              Pick a session on the right to start a timer and track progress.
            </p>
          ) : (
            <div className="activeGrid">
              <div className="activeLeft">
                <h3 className="activeTitle">{activeSession.title}</h3>
                <div className="muted">
                  {activeSession.medium} • {activeSession.durationMin} min
                </div>

                <div className="chipRow" style={{ marginTop: 10 }}>
                  {activeSession.vibes.map((v) => (
                    <span className="tag" key={v}>
                      {v}
                    </span>
                  ))}
                </div>

                <div className="timer">
                  <div className="time">{formatTime(secondsLeft)}</div>
                  <div className="timerBtns">
                    <button
                      className="btn"
                      onClick={() => setRunning((r) => !r)}
                      disabled={secondsLeft === 0}
                    >
                      {running ? "Pause" : "Start"}
                    </button>
                    <button className="btnGhost" onClick={resetTimer}>
                      Reset
                    </button>
                  </div>
                </div>

                <p className="muted">
                  "The aim of art is to represent not the outward appearance of things, but their inward significance." – Aristotle 
                </p>
                <div style={{ marginTop: 14 }}>

                  <div style={{ marginTop: 14 }}>
  <h3>Ambient audio</h3>

  <div className="audioRow">
    <button className="btn" type="button" onClick={() => setAudioOn((x) => !x)}>
      {audioOn ? "Pause" : "Play"}
    </button>

    <label className="audioLabel">
      Volume
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
      />
    </label>
  </div>

  <audio ref={audioRef} src={audio} loop />
</div>

  <div style={{ marginTop: 14 }}>
  <h3>References</h3>

  <div className="refTopRow">
    <label>
      References
      <select value={refType} onChange={(e) => setRefType(e.target.value)}>
        {REFERENCE_TYPES.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.name}
          </option>
        ))}
      </select>
    </label>

    {refType === "styles" && (
      <label>
        Art Styles
        <select value={styleKey} onChange={(e) => setStyleKey(e.target.value)}>
          {STYLE_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.name}
            </option>
          ))}
        </select>
      </label>
    )}
  </div>

  {refType === "styles" && styleKey !== "none" && (
    <div className="refGrid">
      {styleImages.map((src, idx) => (
        <div className="refCard" key={`style-${styleKey}-${idx}`}>
          <img className="refImg" src={src} alt={`style reference ${idx + 1}`} />
        </div>
      ))}
    </div>
  )}

  {refType === "anatomy" && (
    <div className="refGrid">
      {ANATOMY_IMAGES.map((src, idx) => (
        <div className="refCard" key={`anat-${idx}`}>
          <img className="refImg" src={src} alt={`anatomy reference ${idx + 1}`} />
        </div>
      ))}
    </div>
  )}

  {refType === "color" && (
  <div className="refGrid">
    {COLOR_IMAGES.map((src, idx) => (
      <div className="refCard" key={`color-${idx}`}>
        <img className="refImg" src={src} alt={`color reference ${idx + 1}`} />
      </div>
    ))}
  </div>
)}

  {refType === "lighting" && (
  <div className="refGrid">
    {LIGHTING_IMAGES.map((src, idx) => (
      <div className="refCard" key={`light-${idx}`}>
        <img className="refImg" src={src} alt={`lighting reference ${idx + 1}`} />
      </div>
    ))}
  </div>
)}
</div>

</div>

              </div>

              <div className="activeRight">
                <h3>Checklist</h3>
                <div className="checklist">
                  {activeSession.checklist.map((it) => (
                    <label key={it.key} className="checkRow">
                      <input
                        type="checkbox"
                        checked={it.done}
                        onChange={() => toggleChecklistItem(it.key)}
                      />
                      <span className={it.done ? "done" : ""}>{it.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


