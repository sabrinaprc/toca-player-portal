import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Link, useParams} from "react-router-dom";
import "./styles.css";
import logo from "./assets/toca-logo.png";
import { formatDateTime, getDuration } from "./utils/date";

function Header() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("email");
    navigate("/");
  }

  return (
    <header>
      <div className="header-inner">
        <div className="header-left">
          <img src={logo} alt="TOCA logo" className="logo" />
        </div>

        <div className="header-center">
          <h2>TOCA Player Portal</h2>

          <nav className="nav-links">
            <Link to="/home">Home</Link>
            <Link to="/about">About TOCA</Link>
            <Link to="/profile">Profile</Link>
          </nav>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:4000/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const data = await res.json();

      // store email locally
      localStorage.setItem("email", data.email);

      // go to home
      navigate("/home");

    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="login-container">
      <img src={logo} alt="TOCA logo" className="login-logo-hero" />
      <div className="login-box">
        <h1>TOCA Player Portal</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Sign In</button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

function formatTime(date: Date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hh = String(hours); // no leading zero
  const mm = String(minutes).padStart(2, "0");
  return `${hh}:${mm}${ampm}`;
}

function formatDayTimeRange(startIso: string, endIso?: string) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const s = new Date(startIso);
  const day = days[s.getDay()];
  const monthDay = `${s.getMonth() + 1}/${s.getDate()}`; // M/D
  if (endIso) {
    const e = new Date(endIso);
    return `${day} ${monthDay} ${formatTime(s)} - ${formatTime(e)}`;
  }
  return `${day} ${monthDay} ${formatTime(s)}`;
}

function Home() {
  const email = localStorage.getItem("email");

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!email) return;

      try {
        const res = await fetch(
          `http://localhost:4000/portal?email=${encodeURIComponent(email)}`
        );

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error);
        }

        setData(result);
      } catch (err: any) {
        setError(err.message);
      }
    }

    load();
  }, [email]);

  if (!email) return <p>Not signed in.</p>;
  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading...</p>;

  const now = new Date();

  const pastSessions = data.trainingSessions
    .filter((s: any) => new Date(s.startTime) < now)
    .sort(
      (a: any, b: any) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

  const futureAppointments = data.appointments
    .filter((a: any) => new Date(a.startTime) >= now)
    .sort(
      (a: any, b: any) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  return (
    <div>
      <h1>Home</h1>
      <h2>Upcoming Appointments</h2>
      <ul className="list">
        {futureAppointments.map((a: any) => (
          <li key={a.id} className="card-row no-hover">
             <div className="row-top">
               <div className="row-title">{a.trainerName}</div>
               <div className="badge">
                 {getDuration(a.startTime, a.endTime)}
               </div>
             </div>
             <div className="row-meta">
               {formatDayTimeRange(a.startTime, a.endTime)}
             </div>
           </li>
        ))}
      </ul>

      <h2>Past Training Sessions</h2>
      <ul className="list">
        {pastSessions.map((s: any) => (
          <li key={s.id} className="card-row">
            <Link className="card-link" to={`/sessions/${s.id}`}>
              <div className="row-top">
                <div className="row-title">{s.trainerName}</div>
                <div className="badge">Score {s.score}</div>
              </div>
              <div className="row-meta">
                {formatDayTimeRange(s.startTime)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function About() {
  return (
    <div className="page">
      <h1>The Next Generation of Soccer Training</h1>

      <p className="lead">
        TOCA Football provides a one-of-a-kind, tech-enhanced soccer experience
        for players of all ages and skill levels. With training centers across
        the United States and Canada, TOCA combines technology, repetition,
        and structured programming to help players improve faster.
      </p>

      <div className="section">
        <h2>Changing the Future of Soccer Training</h2>
        <p>
          From classes for young players to advanced individual and group
          training sessions, TOCA creates engaging and educational environments
          where players can build confidence, develop skills, and compete at
          higher levels.
        </p>
      </div>

      <div className="section">
        <h2>It All Started with a Tennis Ball</h2>
        <p>
          Founder Eddie Lewis discovered that practicing with a smaller ball
          sharpened his technique and accelerated his development. This
          “small-is-harder” philosophy became the foundation of TOCA’s
          training methodology and continues to drive its innovative,
          performance-focused approach today.
        </p>
      </div>

      <a
        className="external-link"
        href="https://www.tocafootball.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn more at tocafootball.com →
      </a>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!email) {
        navigate("/");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:4000/portal?email=${encodeURIComponent(email)}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }

        setProfile(data.profile);
      } catch (err: any) {
        setError(err.message);
      }
    }

    load();
  }, [email, navigate]);

  if (!email) return <p>Not signed in.</p>;
  if (error) return <p>{error}</p>;
  if (!profile) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Profile</h1>

      <div className="panel">
        <div className="kv">
          <div className="k">Email</div>
          <div className="v">{profile.email}</div>
        </div>

        <div className="kv">
          <div className="k">Name</div>
          <div className="v">{profile.firstName} {profile.lastName}</div>
        </div>

        <div className="kv">
          <div className="k">Phone</div>
          <div className="v">{profile.phone ?? "-"}</div>
        </div>

        <div className="kv">
          <div className="k">Gender</div>
          <div className="v">{profile.gender ?? "-"}</div>
        </div>

        <div className="kv">
          <div className="k">Date of birth</div>
          <div className="v">{profile.dob ?? "-"}</div>
        </div>

        <div className="kv">
          <div className="k">Location</div>
          <div className="v">{profile.centerName ?? "-"}</div>
        </div>

        <div className="kv">
          <div className="k">Created at</div>
          <div className="v">{profile.createdAt ? formatDateTime(profile.createdAt) : "-"}</div>
        </div>
      </div>
    </div>
  );
}

function SessionDetails() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (!id) return;

        const res = await fetch(
          `http://localhost:4000/sessions/${encodeURIComponent(id)}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }

        setSession(data);
      } catch (err: any) {
        setError(err.message);
      }
    }

    load();
  }, [id]);

  if (!id) return <p>Missing session id.</p>;
  if (error) return <p>{error}</p>;
  if (!session) return <p>Loading...</p>;

  return (
    <div className="page">
      <Link to="/home" className="back-link">
        ← Back to Home
      </Link>

      <div className="session-card">
        <div className="session-header">
          <h1>Session Details</h1>
          <div className="session-badge">
            {getDuration(session.startTime, session.endTime)}
          </div>
        </div>

        <div className="session-meta">
          <div><strong>Trainer:</strong> {session.trainerName}</div>
          <div>
            <strong>Time:</strong>{" "}
            {formatDayTimeRange(session.startTime, session.endTime)}
          </div>
        </div>

        <h2 className="stats-title">Performance Stats</h2>

        <div className="stats-grid">
          <div className="stat">
            <div className="stat-label">Score</div>
            <div className="stat-value">{session.score}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Goals</div>
            <div className="stat-value">{session.numberOfGoals}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Best Streak</div>
            <div className="stat-value">{session.bestStreak}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Balls</div>
            <div className="stat-value">{session.numberOfBalls}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Avg Speed</div>
            <div className="stat-value">{session.avgSpeedOfPlay}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Exercises</div>
            <div className="stat-value">{session.numberOfExercises}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />

        <Route
          path="/home"
          element={
            <>
              <Header />
              <div className="page-container">
                <Home />
              </div>
            </>
          }
        />

        <Route
          path="/about"
          element={
            <>
              <Header />
              <div className="page-container">
                <About />
              </div>
            </>
          }
        />

        <Route
          path="/profile"
          element={
            <>
              <Header />
              <div className="page-container">
                <Profile />
              </div>
            </>
          }
        />

        <Route
          path="/sessions/:id"
          element={
            <>
              <Header />
              <div className="page-container">
                <SessionDetails />
              </div>
            </>
          }
        />

        <Route path="*" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}