import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Link, useParams} from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("email");
    navigate("/");
  }

  return (
    <div>
      <h2>TOCA Player Portal</h2>

      <nav>
        <Link to="/home">Home</Link> |{" "}
        <Link to="/about">About TOCA</Link> |{" "}
        <Link to="/profile">Profile</Link>
      </nav>

      <button onClick={handleLogout}>Logout</button>

      <hr />
    </div>
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
    <div>
      <h1>TOCA Player Portal</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Sign In</button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
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

      <h2>Past Training Sessions</h2>
      <ul>
        {pastSessions.map((s: any) => (
          <li key={s.id}>
            <Link to={`/sessions/${s.id}`}>
              {new Date(s.startTime).toLocaleString()} — {s.trainerName} — Score {s.score}
            </Link>
          </li>
        ))}
      </ul>

      <h2>Future Appointments</h2>
      <ul>
        {futureAppointments.map((a: any) => (
          <li key={a.id}>
            {new Date(a.startTime).toLocaleString()} — {a.trainerName}
          </li>
        ))}
      </ul>
    </div>
  );
}

function About() {
  return (
    <div>
      <h1>The Next Generation of Soccer Training</h1>

      <p>
        TOCA Football provides a one-of-a-kind, tech-enhanced soccer experience
        for players of all ages and skill levels. With training centers across
        the United States and Canada, TOCA combines technology, repetition,
        and structured programming to help players improve faster.
      </p>

      <h2>Changing the Future of Soccer Training</h2>

      <p>
        From classes for young players to advanced individual and group
        training sessions, TOCA creates engaging and educational environments
        where players can build confidence, develop skills, and compete at
        higher levels.
      </p>

      <h2>It All Started with a Tennis Ball</h2>

      <p>
        Founder Eddie Lewis discovered that practicing with a smaller ball
        sharpened his technique and accelerated his development. This
        “small-is-harder” philosophy became the foundation of TOCA’s
        training methodology and continues to drive its innovative,
        performance-focused approach today.
      </p>
      <p>
        <a
          href="https://www.tocafootball.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more at tocafootball.com →
        </a>
      </p>
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
    <div>
      <h1>Profile</h1>

      <p><b>Email:</b> {profile.email}</p>
      <p><b>Name:</b> {profile.firstName} {profile.lastName}</p>
      <p><b>Phone:</b> {profile.phone ?? "-"}</p>
      <p><b>Gender:</b> {profile.gender ?? "-"}</p>
      <p><b>Date of birth:</b> {profile.dob ?? "-"}</p>
      <p><b>Center:</b> {profile.centerName ?? "-"}</p>
      <p><b>Created at:</b> {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "-"}</p>
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
    <div>
      <p>
        <Link to="/home">← Back to Home</Link>
      </p>

      <h1>Session Details</h1>

      <p><b>Trainer:</b> {session.trainerName}</p>
      <p><b>Start:</b> {new Date(session.startTime).toLocaleString()}</p>
      <p><b>End:</b> {new Date(session.endTime).toLocaleString()}</p>

      <h2>Stats</h2>
      <ul>
        <li>Score: {session.score}</li>
        <li>Goals: {session.numberOfGoals}</li>
        <li>Best streak: {session.bestStreak}</li>
        <li>Balls: {session.numberOfBalls}</li>
        <li>Avg speed of play: {session.avgSpeedOfPlay}</li>
        <li>Exercises: {session.numberOfExercises}</li>
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />

        <Route path="/home" element={<><Header /><Home /></>} />
        <Route path="/about" element={<><Header /><About /></>} />
        <Route path="/profile" element={<><Header /><Profile /></>} />
        <Route path="/sessions/:id" element={<><Header /><SessionDetails /></>} />

        <Route path="*" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}
