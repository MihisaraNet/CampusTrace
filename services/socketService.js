const { WebSocketServer, WebSocket } = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');

let wss = null;
// Map of userId -> Set of active WebSocket instances
const userSockets = new Map();
// Map of WebSocket -> { userId, role }
const socketMetadata = new Map();

/**
 * Initialize WebSocket Server attached to the HTTP server
 */
const initWebSocket = (server) => {
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const parsedUrl = url.parse(request.url, true);
    if (parsedUrl.pathname === '/ws') {
      const token = parsedUrl.query.token;

      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        wss.handleUpgrade(request, socket, head, (ws) => {
          ws.user = decoded; // { id, role, ... }
          wss.emit('connection', ws, request);
        });
      } catch (err) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    }
  });

  wss.on('connection', (ws) => {
    const userId = ws.user?.id;
    const role = ws.user?.role || 'student';

    if (userId) {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(ws);
      socketMetadata.set(ws, { userId, role });
    }

    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch {
        // ignore non-JSON messages
      }
    });

    ws.on('close', () => {
      if (userId && userSockets.has(userId)) {
        const sockets = userSockets.get(userId);
        sockets.delete(ws);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
      socketMetadata.delete(ws);
    });

    // Send initial connected confirmation
    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to CampusTrace real-time alert service' }));
  });

  // Heartbeat interval to prune stale connections
  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
};

/**
 * Send real-time notification to a specific user
 */
const sendToUser = (userId, data) => {
  const idStr = userId.toString();
  const sockets = userSockets.get(idStr);
  if (sockets && sockets.size > 0) {
    const payload = JSON.stringify(data);
    sockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }
};

/**
 * Broadcast real-time message to ALL connected users (with optional exclusion)
 */
const broadcastToAll = (data, excludeUserId = null) => {
  const excludeStr = excludeUserId ? excludeUserId.toString() : null;
  const payload = JSON.stringify(data);

  if (!wss) return;
  wss.clients.forEach((ws) => {
    const meta = socketMetadata.get(ws);
    if (meta && excludeStr && meta.userId === excludeStr) {
      return;
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
};

/**
 * Broadcast real-time message to all connected admins
 */
const broadcastToAdmins = (data) => {
  const payload = JSON.stringify(data);
  if (!wss) return;

  wss.clients.forEach((ws) => {
    const meta = socketMetadata.get(ws);
    if (meta && meta.role === 'admin' && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
};

module.exports = {
  initWebSocket,
  sendToUser,
  broadcastToAll,
  broadcastToAdmins,
};
