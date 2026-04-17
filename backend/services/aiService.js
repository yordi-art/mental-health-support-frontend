/**
 * AI Bridge — Node.js → Python AI Microservice
 * This system uses machine learning to support decision-making
 * and does not replace professional medical diagnosis.
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

async function callAI(path, body) {
  const res  = await fetch(`${AI_SERVICE_URL}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `AI service error: ${res.status}`);
  return data;
}

module.exports = { callAI };
