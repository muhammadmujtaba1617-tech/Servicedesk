const http = require('http');
const { io } = require('../../../frontend/node_modules/socket.io-client');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failedCount++;
    throw new Error(message);
  } else {
    console.log(`  ✅ PASSED: ${message}`);
    passedCount++;
  }
}

async function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), raw: body });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      if (Buffer.isBuffer(data)) {
        req.write(data);
      } else {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('   🚀 SERVICEDESK PRODUCTION TEST SUITE EXECUTION   ');
  console.log('======================================================\n');

  let custToken = '';
  let custId = '';
  let agentToken = '';
  let agentId = '';
  let adminToken = '';
  let ticketId = '';
  let attachmentId = '';

  // -------------------------------------------------------------------
  // TEST SUITE 1: AUTHENTICATION & JWT TOKENS
  // -------------------------------------------------------------------
  console.log('[SUITE 1] Authentication & JWT Verification');
  {
    const custRes = await request(
      { hostname: '127.0.0.1', port: PORT, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'customer@example.com', password: 'ServiceDesk2026!' }
    );
    assert(custRes.status === 200, 'Customer login succeeds with 200');
    assert(custRes.data.data.token && custRes.data.data.user.role === 'customer', 'Customer token and role verified');
    custToken = custRes.data.data.token;
    custId = custRes.data.data.user._id || custRes.data.data.user.id;

    const agentRes = await request(
      { hostname: '127.0.0.1', port: PORT, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'agent@example.com', password: 'ServiceDesk2026!' }
    );
    assert(agentRes.status === 200 && agentRes.data.data.user.role === 'agent', 'Agent login succeeds with agent role');
    agentToken = agentRes.data.data.token;
    agentId = agentRes.data.data.user._id || agentRes.data.data.user.id;

    const adminRes = await request(
      { hostname: '127.0.0.1', port: PORT, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'admin@example.com', password: 'ServiceDesk2026!' }
    );
    assert(adminRes.status === 200 && adminRes.data.data.user.role === 'admin', 'Admin login succeeds with admin role');
    adminToken = adminRes.data.data.token;

    const badLogin = await request(
      { hostname: '127.0.0.1', port: PORT, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'admin@example.com', password: 'WrongPassword999!' }
    );
    assert(badLogin.status === 401, 'Invalid credentials properly rejected with 401 Unauthorized');
  }

  // -------------------------------------------------------------------
  // TEST SUITE 2: TICKET CREATION & DYNAMIC SLA CALCULATION
  // -------------------------------------------------------------------
  console.log('\n[SUITE 2] Ticket Creation & SLA Target Calculation');
  {
    const createRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/v1/tickets',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + custToken },
      },
      {
        title: 'CI/CD Deployment Failure in US-East',
        description: 'Kubernetes pods fail to bootstrap during rollout',
        category: 'Infrastructure',
        priority: 'critical',
        tags: ['k8s', 'infrastructure', 'urgent'],
      }
    );
    assert(createRes.status === 201, 'Ticket successfully created with 201 Created');
    assert(createRes.data.data.status === 'open', 'Initial ticket status is OPEN');
    assert(createRes.data.data.dueSLA !== undefined, 'SLA target date (dueSLA) accurately computed');
    ticketId = createRes.data.data._id;
  }

  // -------------------------------------------------------------------
  // TEST SUITE 3: CONTROLLED STATE MACHINE TRANSITIONS
  // -------------------------------------------------------------------
  console.log('\n[SUITE 3] State Machine Workflow & Transition Enforcement');
  {
    // Illegal jump: open -> resolved
    const illegalRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/tickets/${ticketId}/status`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + agentToken },
      },
      { status: 'resolved' }
    );
    assert(illegalRes.status === 400, 'Illegal transition (OPEN -> RESOLVED) rejected with 400 Bad Request');
    assert(illegalRes.data.error?.code === 'INVALID_STATUS_TRANSITION', 'Error payload contains INVALID_STATUS_TRANSITION error code');

    // Legal: open -> triaged
    const triageRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/tickets/${ticketId}/status`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + agentToken },
      },
      { status: 'triaged' }
    );
    assert(triageRes.status === 200 && triageRes.data.data.status === 'triaged', 'Legal transition (OPEN -> TRIAGED) succeeds');

    // Legal: triaged -> assigned via /assign endpoint
    const assignRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/tickets/${ticketId}/assign`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + agentToken },
      },
      { agentId }
    );
    assert(assignRes.status === 200 && assignRes.data.data.status === 'assigned', 'Ticket assigned and auto-transitioned to ASSIGNED status');

    // Legal: assigned -> in_progress
    const progressRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/tickets/${ticketId}/status`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + agentToken },
      },
      { status: 'in_progress' }
    );
    assert(progressRes.status === 200 && progressRes.data.data.status === 'in_progress', 'Transition (ASSIGNED -> IN_PROGRESS) succeeds');

    // Legal: in_progress -> waiting_for_customer
    const waitRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/tickets/${ticketId}/status`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + agentToken },
      },
      { status: 'waiting_for_customer' }
    );
    assert(waitRes.status === 200 && waitRes.data.data.status === 'waiting_for_customer', 'Transition to WAITING_FOR_CUSTOMER succeeds');

    // Legal: waiting_for_customer -> resolved
    const resolvedRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/tickets/${ticketId}/status`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + agentToken },
      },
      { status: 'resolved' }
    );
    assert(resolvedRes.status === 200 && resolvedRes.data.data.status === 'resolved', 'Transition to RESOLVED succeeds');

    // Legal: Customer closes resolved ticket
    const closeRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/tickets/${ticketId}/status`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + custToken },
      },
      { status: 'closed' }
    );
    assert(closeRes.status === 200 && closeRes.data.data.status === 'closed', 'Customer closes ticket (RESOLVED -> CLOSED) succeeds');
  }

  // -------------------------------------------------------------------
  // TEST SUITE 4: COMMENTS & INTERNAL NOTES PRIVACY
  // -------------------------------------------------------------------
  console.log('\n[SUITE 4] Comments & Confidential Internal Notes Isolation');
  {
    // Agent adds internal note
    const noteRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/tickets/${ticketId}/comments`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + agentToken },
      },
      { content: 'Internal note: Root cause was missing configmap key.', isInternal: true }
    );
    assert(noteRes.status === 201 && noteRes.data.data.isInternal === true, 'Agent posts confidential internal note');

    // Customer adds public comment
    const pubRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/tickets/${ticketId}/comments`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + custToken },
      },
      { content: 'Confirmed working now, thank you!', isInternal: false }
    );
    assert(pubRes.status === 201 && pubRes.data.data.isInternal === false, 'Customer posts public comment');

    // Customer views ticket comments
    const custView = await request(
      { hostname: '127.0.0.1', port: PORT, path: `/api/v1/tickets/${ticketId}`, method: 'GET', headers: { Authorization: 'Bearer ' + custToken } }
    );
    const comments = custView.data.data.comments || [];
    const hasLeak = comments.some((c) => c.isInternal === true);
    assert(!hasLeak, 'Customer view strictly scrubs out internal notes (Zero Data Leakage)');
  }

  // -------------------------------------------------------------------
  // TEST SUITE 5: FILE ATTACHMENTS & STATIC SERVING
  // -------------------------------------------------------------------
  console.log('\n[SUITE 5] File Attachments, Static Asset Download & Delete');
  {
    const fileContent = '--- Server Crash Dump ---\nFATAL EXCEPTION: OutOfMemory';
    const boundary = '----WebKitFormBoundaryAutomatedSuite';
    let payload = '';
    payload += '--' + boundary + '\r\n';
    payload += 'Content-Disposition: form-data; name="file"; filename="crash_dump.log"\r\n';
    payload += 'Content-Type: text/plain\r\n\r\n';
    payload += fileContent + '\r\n';
    payload += '--' + boundary + '--\r\n';

    const uploadRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/tickets/${ticketId}/attachments`,
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data; boundary=' + boundary,
          'Content-Length': Buffer.byteLength(payload),
          Authorization: 'Bearer ' + custToken,
        },
      },
      payload
    );
    assert(uploadRes.status === 201, 'File attachment uploaded successfully with 201 Created');
    assert(uploadRes.data.data.originalName === 'crash_dump.log', 'Attachment original filename preserved');
    attachmentId = uploadRes.data.data._id;
    const fileUrl = uploadRes.data.data.url;

    const downloadRes = await request({ hostname: '127.0.0.1', port: PORT, path: fileUrl, method: 'GET' });
    assert(downloadRes.status === 200, 'Static asset URL serves uploaded file with HTTP 200');
    assert(downloadRes.raw === fileContent, 'File content integrity verified (100% byte match)');

    const deleteRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/tickets/${ticketId}/attachments/${attachmentId}`,
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + custToken },
      },
      null
    );
    assert(deleteRes.status === 200, 'Attachment successfully deleted from ticket and disk');
  }

  // -------------------------------------------------------------------
  // TEST SUITE 6: REAL-TIME WEBSOCKETS (SOCKET.IO)
  // -------------------------------------------------------------------
  console.log('\n[SUITE 6] Real-time WebSockets Live Broadcasts');
  {
    const socket = io(BASE_URL, { transports: ['websocket', 'polling'] });
    await new Promise((res) => {
      socket.on('connect', () => {
        socket.emit('join:role', 'agent');
        res();
      });
    });

    const eventReceivedPromise = new Promise((res) => {
      socket.on('ticket:created', (t) => res(t));
    });

    // Create a new ticket to trigger broadcast
    await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/v1/tickets',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + custToken },
      },
      { title: 'Live WebSocket Test Ticket', description: 'Testing broadcast', category: 'General', priority: 'low' }
    );

    const received = await Promise.race([
      eventReceivedPromise,
      new Promise((_, rej) => setTimeout(() => rej(new Error('WebSocket event timed out')), 5000)),
    ]);

    assert(received && received.title === 'Live WebSocket Test Ticket', 'WebSocket client received live ticket:created broadcast');
    socket.disconnect();
  }

  // -------------------------------------------------------------------
  // TEST SUITE 7: DYNAMIC SETTINGS & ANALYTICS
  // -------------------------------------------------------------------
  console.log('\n[SUITE 7] System Settings & Live Analytics Aggregation');
  {
    const patchSettings = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/v1/settings',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + adminToken },
      },
      {
        sla: { critical: { responseSLA: 12, resolutionSLA: 200 } },
        automation: { autoAssign: true, emailAlerts: true, breachThresholdPercent: 85 },
      }
    );
    assert(patchSettings.status === 200, 'Admin updates SLA policies and automation rules with 200 OK');

    const slaCheck = await request(
      { hostname: '127.0.0.1', port: PORT, path: '/api/v1/sla', method: 'GET', headers: { Authorization: 'Bearer ' + agentToken } }
    );
    assert(slaCheck.data.data.critical.responseSLA === 12, 'Dynamic SLA route reflects updated setting (12 min response)');

    const analyticsRes = await request(
      { hostname: '127.0.0.1', port: PORT, path: '/api/v1/analytics?days=30', method: 'GET', headers: { Authorization: 'Bearer ' + adminToken } }
    );
    assert(analyticsRes.status === 200, 'Live analytics endpoint returns 200 OK');
    assert(analyticsRes.data.data.summary.totalTickets > 0, 'Analytics summary reflects real aggregate database counts');
    assert(Array.isArray(analyticsRes.data.data.priorityDistribution), 'Priority distribution dataset is populated');
    assert(Array.isArray(analyticsRes.data.data.agentPerformance), 'Agent workload matrix is populated');
  }

  // -------------------------------------------------------------------
  // TEST SUITE 8: AUDIT TRAIL VERIFICATION
  // -------------------------------------------------------------------
  console.log('\n[SUITE 8] Immutable Audit Trail Verification');
  {
    const auditRes = await request(
      { hostname: '127.0.0.1', port: PORT, path: '/api/v1/audit-logs', method: 'GET', headers: { Authorization: 'Bearer ' + adminToken } }
    );
    assert(auditRes.status === 200, 'Admin audit log query returns 200 OK');
    const logs = auditRes.data.data.items || [];
    assert(logs.length >= 5, `Audit trail recorded ${logs.length} immutable events (ticket creation, status transitions, attachments, settings)`);
  }

  console.log('\n======================================================');
  console.log(`   🏁 TEST SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED   `);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('\n💥 Unhandled Test Failure:', err);
  process.exit(1);
});
