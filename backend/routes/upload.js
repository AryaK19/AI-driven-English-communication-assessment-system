// backend/routes/upload.js
import express from 'express';
import AWS from 'aws-sdk';
const router = express.Router();

AWS.config.update({
  accessKeyId: "",
  secretAccessKey: "",
  region: "",
});

const s3 = new AWS.S3();

router.post('/generate-presigned-url', (req, res) => {
  const params = {
    Bucket: 'Bucket name',
    Key: `AI-interview/audio/${Date.now()}.mp3`,
    ContentType: 'audio/mpeg',

  };

  s3.getSignedUrl('putObject', params, (err, url) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ url }); // Ensure a valid JSON response
  });
});

export default router;