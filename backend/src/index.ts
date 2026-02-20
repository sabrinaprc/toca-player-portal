import express from "express";
import path from "path";
import { readJson, dataPath } from "./readJson";
import cors from "cors";

type Profile = { id: string; email: string; [k: string]: any };
type TrainingSession = { id: string; playerId: string; startTime: string; [k: string]: any };
type Appointment = { id: string; playerId: string; startTime: string; [k: string]: any };

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json());

app.get("/", (_req, res) => res.send("TOCA API is running. Try /health"));
app.get("/health", (_req, res) => res.json({ ok: true }));


// Loads all data from disk. In a real app, this would be a database query.
async function loadAll() {
  const profiles = await readJson<Profile[]>(dataPath("profiles.json"));
  const trainingSessions = await readJson<TrainingSession[]>(dataPath("trainingSessions.json"));
  const appointments = await readJson<Appointment[]>(dataPath("appointments.json"));
  return { profiles, trainingSessions, appointments };
}

// Simple sign-in endpoint that looks up a profile by email. In a real app, this would have proper authentication.
app.post("/signin", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Email required" });

  const { profiles } = await loadAll();
  const profile = profiles.find(p => String(p.email).toLowerCase() === email);
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  res.json({ email, profile });
});

// Endpoint to get a player's profile, training sessions, and appointments by email.
app.get("/portal", async (req, res) => {
  const email = String(req.query.email ?? "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "email query param required" });

  const { profiles, trainingSessions, appointments } = await loadAll();

  const profile = profiles.find(p => String(p.email).toLowerCase() === email);
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const playerId = profile.id;

  const playerSessions = trainingSessions.filter(s => s.playerId === playerId);
  const playerAppointments = appointments.filter(a => a.playerId === playerId);

  res.json({
    profile,
    trainingSessions: playerSessions,
    appointments: playerAppointments
  });
});

app.get("/sessions/:id", async (req, res) => {
  const { trainingSessions } = await loadAll();
  const session = trainingSessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(session);
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));