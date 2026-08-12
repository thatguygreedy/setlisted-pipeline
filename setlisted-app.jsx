import React, { useState, useMemo } from "react";
import { Search, Radio, Heart, Filter, X, Menu, Compass, ListMusic, User } from "lucide-react";

const GENRES = [
  "All",
  "House",
  "Melodic House/Techno",
  "Trance",
  "Afro House",
  "Bass House",
  "Progressive House",
  "Techno",
];

const STATIONS = [
  {
    id: "diplo-revolution",
    dj: "Diplo",
    show: "Diplo's Revolution",
    network: "SiriusXM",
    live: true,
    followers: "128K",
    genres: ["Bass House", "House", "Afro House"],
    current: {
      title: "Turn Me On",
      artist: "Diplo, Vula",
      genre: "Bass House",
      playedAt: "just now",
    },
    recent: [
      { title: "Not Ready For Love", artist: "Diplo, Maya B", genre: "House", playedAt: "8m ago" },
      { title: "Lucky Me", artist: "Diplo, Great Good Fine Ok", genre: "Afro House", playedAt: "21m ago" },
      { title: "Let Me Take You There", artist: "Diplo, Laura White", genre: "House", playedAt: "34m ago" },
    ],
  },
  {
    id: "tiesto-prismatic",
    dj: "Tiësto",
    show: "Prismatic",
    network: "SiriusXM",
    live: true,
    followers: "241K",
    genres: ["Trance", "Progressive House"],
    current: {
      title: "Adagio for Strings",
      artist: "Tiësto",
      genre: "Trance",
      playedAt: "just now",
    },
    recent: [
      { title: "Traffic", artist: "Tiësto", genre: "Trance", playedAt: "6m ago" },
      { title: "Suburban Train", artist: "Tiësto, Wolfpack", genre: "Progressive House", playedAt: "19m ago" },
      { title: "Elements of Life", artist: "Tiësto", genre: "Trance", playedAt: "33m ago" },
    ],
  },
  {
    id: "aboveandbeyond-grouptherapy",
    dj: "Above & Beyond",
    show: "Group Therapy Radio",
    network: "SiriusXM",
    live: false,
    followers: "96K",
    genres: ["Trance", "Melodic House/Techno"],
    current: {
      title: "Sun & Moon",
      artist: "Above & Beyond, Richard Bedford",
      genre: "Trance",
      playedAt: "2h ago",
    },
    recent: [
      { title: "Alchemy", artist: "Above & Beyond, Zoe Johnston", genre: "Melodic House/Techno", playedAt: "2h ago" },
      { title: "Northern Soul", artist: "Above & Beyond, Richard Bedford", genre: "Trance", playedAt: "2h ago" },
    ],
  },
  {
    id: "digweed-transitions",
    dj: "John Digweed",
    show: "Transitions",
    network: "SiriusXM",
    live: false,
    followers: "54K",
    genres: ["Techno", "Melodic House/Techno"],
    current: {
      title: "Heartbeat",
      artist: "John Digweed, Nick Muir",
      genre: "Techno",
      playedAt: "5h ago",
    },
    recent: [
      { title: "Poles Apart", artist: "John Digweed", genre: "Melodic House/Techno", playedAt: "5h ago" },
    ],
  },
];

function EqBars({ active }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: 2,
        height: 12,
        marginRight: 6,
      }}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 2.5,
            background: active ? "#2EE6B8" : "#5B5F7E",
            borderRadius: 1,
            animation: active ? `eqbar 0.9s ease-in-out ${i * 0.15}s infinite` : "none",
            height: active ? undefined : 4,
          }}
        />
      ))}
    </span>
  );
}

function GenrePill({ genre }) {
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10.5,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        color: "#A6ABCB",
        background: "#1C2038",
        border: "1px solid #2A2F4D",
        borderRadius: 4,
        padding: "3px 7px",
      }}
    >
      {genre}
    </span>
  );
}

function StationCard({ station, followed, onToggleFollow }) {
  return (
    <div
      style={{
        background: "#14172A",
        border: "1px solid #232748",
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "linear-gradient(160deg, #FF3E6C 0%, #7A1E3A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 20,
              color: "#0B0D17",
              flexShrink: 0,
            }}
          >
            {station.dj.charAt(0)}
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 22,
                letterSpacing: 0.5,
                color: "#EDEBFA",
                lineHeight: 1.1,
              }}
            >
              {station.dj}
            </div>
            <div style={{ fontSize: 12.5, color: "#7D82A6" }}>
              {station.show} · {station.network}
            </div>
          </div>
        </div>
        <button
          onClick={() => onToggleFollow(station.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: followed ? "#FF3E6C" : "transparent",
            border: followed ? "1px solid #FF3E6C" : "1px solid #2A2F4D",
            color: followed ? "#1C0410" : "#C7CAE3",
            fontSize: 12.5,
            fontWeight: 600,
            padding: "7px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <Heart size={13} fill={followed ? "#1C0410" : "none"} />
          {followed ? "Following" : "Follow"}
        </button>
      </div>

      <div
        style={{
          background: "#0F1223",
          border: "1px solid #1E2340",
          borderRadius: 10,
          padding: "12px 14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5,
              letterSpacing: 0.6,
              color: station.live ? "#2EE6B8" : "#7D82A6",
              textTransform: "uppercase",
            }}
          >
            <EqBars active={station.live} />
            {station.live ? "On air now" : "Last played"}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5B5F7E" }}>
            {station.current.playedAt}
          </span>
        </div>
        <div style={{ fontSize: 15.5, color: "#EDEBFA", fontWeight: 600 }}>{station.current.title}</div>
        <div style={{ fontSize: 12.5, color: "#9498BC", marginBottom: 8 }}>{station.current.artist}</div>
        <GenrePill genre={station.current.genre} />
      </div>

      {station.recent.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {station.recent.map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 8,
                borderBottom: i < station.recent.length - 1 ? "1px solid #1C2038" : "none",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    color: "#C7CAE3",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.title}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "#6E7295",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.artist}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 10 }}>
                <GenrePill genre={t.genre} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#5B5F7E" }}>
                  {t.playedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [genre, setGenre] = useState("All");
  const [query, setQuery] = useState("");
  const [followed, setFollowed] = useState(new Set(["diplo-revolution"]));
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);

  const toggleFollow = (id) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return STATIONS.filter((s) => {
      if (showFollowedOnly && !followed.has(s.id)) return false;
      if (genre !== "All" && !s.genres.includes(genre) && s.current.genre !== genre) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = [s.dj, s.show, s.current.title, s.current.artist, ...s.recent.map((r) => r.title + " " + r.artist)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [genre, query, showFollowedOnly, followed]);

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#0B0D17",
        minHeight: "100vh",
        color: "#EDEBFA",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes eqbar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-thumb { background: #2A2F4D; border-radius: 3px; }
        input::placeholder { color: #5B5F7E; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "#0B0D17",
            borderBottom: "1px solid #1C2038",
            padding: "18px 18px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Radio size={20} color="#FF3E6C" />
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 24,
                  letterSpacing: 1,
                  color: "#EDEBFA",
                }}
              >
                SETLISTED
              </span>
            </div>
            <Menu size={20} color="#7D82A6" />
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#14172A",
                border: "1px solid #232748",
                borderRadius: 9,
                padding: "9px 12px",
              }}
            >
              <Search size={15} color="#5B5F7E" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search DJs, shows, tracks"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#EDEBFA",
                  fontSize: 13.5,
                  width: "100%",
                }}
              />
              {query && (
                <X size={14} color="#5B5F7E" style={{ cursor: "pointer" }} onClick={() => setQuery("")} />
              )}
            </div>
            <button
              onClick={() => setShowFollowedOnly((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: showFollowedOnly ? "#FF3E6C" : "#14172A",
                border: showFollowedOnly ? "1px solid #FF3E6C" : "1px solid #232748",
                borderRadius: 9,
                padding: "0 12px",
                cursor: "pointer",
              }}
              aria-label="Show followed only"
            >
              <Filter size={14} color={showFollowedOnly ? "#1C0410" : "#7D82A6"} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 14,
            }}
          >
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                style={{
                  flexShrink: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11.5,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                  padding: "7px 12px",
                  borderRadius: 7,
                  border: genre === g ? "1px solid #2EE6B8" : "1px solid #232748",
                  background: genre === g ? "rgba(46,230,184,0.12)" : "transparent",
                  color: genre === g ? "#2EE6B8" : "#7D82A6",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div style={{ padding: "16px 18px 90px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#5B5F7E", fontSize: 13.5, marginTop: 60 }}>
              No shows match those filters.
            </div>
          ) : (
            filtered.map((s) => (
              <StationCard key={s.id} station={s} followed={followed.has(s.id)} onToggleFollow={toggleFollow} />
            ))
          )}
        </div>

        {/* Bottom nav */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            maxWidth: 460,
            background: "#0F1223",
            borderTop: "1px solid #1C2038",
            display: "flex",
            justifyContent: "space-around",
            padding: "10px 0 14px",
          }}
        >
          {[
            { icon: ListMusic, label: "Feed" },
            { icon: Compass, label: "Discover" },
            { icon: Heart, label: "Following" },
            { icon: User, label: "Profile" },
          ].map(({ icon: Icon, label }, i) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <Icon size={19} color={i === 0 ? "#FF3E6C" : "#5B5F7E"} />
              <span style={{ fontSize: 10, color: i === 0 ? "#FF3E6C" : "#5B5F7E" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
