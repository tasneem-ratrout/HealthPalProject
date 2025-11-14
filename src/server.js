// import express from 'express';
// import cors from 'cors';
// import 'dotenv/config';
// import { pool } from './db.js'; 
// import authRoutes from './routes/authRoutes.js'; 
// import guidesRoutes from './routes/guidesRoutes.js';

// import alertsRoutes from './routes/alertsRoutes.js';

// import workshopsRoutes from './routes/workshopsRoutes.js';

// import registrationsRoutes from './routes/registrationsRoutes.js';
// import sessionsRoutes from './routes/sessionsRoutes.js';

// import supportGroupsRoutes from './routes/supportGroupsRoutes.js';


// //import "./services/reminderJob.js";

// const app = express();
// app.use(cors());
// app.use(express.json());

// console.log('✅ server.js loaded, routes being registered...');

// app.get('/api/health', async (_req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT NOW() AS time');
//     res.json({ status: 'ok', db_time: rows[0].time });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/guides', guidesRoutes);
// app.use('/api/v1/alerts', alertsRoutes);

// app.use('/api/v1/workshops', workshopsRoutes);
// app.use('/api/v1/registrations', registrationsRoutes);
// app.use('/api/v1/sessions', sessionsRoutes);
// app.use('/api/v1/supportgroup', supportGroupsRoutes);




// const port = process.env.PORT || 3000;
// app.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));
// import "./services/reminderCron.js";
// import "./services/reminderJob.js";

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { pool } from './db.js'; 
import authRoutes from './routes/authRoutes.js'; 
import guidesRoutes from './routes/guidesRoutes.js';
import alertsRoutes from './routes/alertsRoutes.js';
import workshopsRoutes from './routes/workshopsRoutes.js';
import registrationsRoutes from './routes/registrationsRoutes.js';
import sessionsRoutes from './routes/sessionsRoutes.js';
import supportGroupsRoutes from './routes/supportGroupsRoutes.js';
import anonymousRoutes from './routes/anonymousRoutes.js';
import drugRoutes from "./routes/drugRoutes.js";
import { createServer } from 'http';
import { Server } from 'socket.io';

import { v4 as uuidv4 } from 'uuid';
const app = express();
app.use(cors());
app.use(express.json());

// جميع الـ routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/guides', guidesRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/workshops', workshopsRoutes);
app.use('/api/v1/registrations', registrationsRoutes);
app.use('/api/v1/sessions', sessionsRoutes);
app.use('/api/v1/supportgroup', supportGroupsRoutes);
app.use('/api/v1/anonymous', anonymousRoutes);

app.use('/api/v1/drugs', drugRoutes);
const httpServer = createServer(app);
export const io = new Server(httpServer, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    const { roomId, message, sender } = data;
    io.to(roomId).emit('receive_message', { message, sender, time: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));

import "./services/reminderCron.js";
import "./services/reminderJob.js";
