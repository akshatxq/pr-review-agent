import crypto from 'crypto';

export const validateWebhook = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    return res.status(401).json({ error: 'No signature found' });
  }

  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(req.body).digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  req.body = JSON.parse(req.body.toString());
  next();
};