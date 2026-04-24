// Vercel API route for contact form submissions
// Deploys to https://your-vercel-app.vercel.app/api/contact
// Set GITHUB_PAT environment variable in Vercel dashboard
// The PAT needs: public_repo scope (same scope used for issue creation)

const GITHUB_HEADERS = {
  'Accept': 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
};

const REPO = 'Unwrenchable/unwrenchable.github.io';

// Upload a file to the repository's uploads/ folder using the Contents API.
// Returns the web URL of the uploaded file, or null on failure.
async function uploadToRepo(fileName, fileDataBase64, pat) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `uploads/${Date.now()}-${rand}-${safeName}`;
  const uploadRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: { ...GITHUB_HEADERS, 'Authorization': `Bearer ${pat}` },
      body: JSON.stringify({
        message: `contact form attachment: ${fileName}`,
        content: fileDataBase64,
      }),
    }
  );
  if (!uploadRes.ok) {
    const errBody = await uploadRes.text().catch(() => '');
    console.error('Contents API upload failed', uploadRes.status, errBody);
    return null;
  }
  const result = await uploadRes.json();
  return result.content?.html_url || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message, file } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  // Handle optional file attachment — upload to repo using Contents API
  let attachmentLine = '';
  if (file && file.name && file.data) {
    try {
      const fileUrl = await uploadToRepo(file.name, file.data, process.env.GITHUB_PAT);
      attachmentLine = fileUrl
        ? `\n\n**Attachment:** [${file.name}](${fileUrl})`
        : `\n\n**Attachment:** ${file.name} _(upload failed)_`;
    } catch (err) {
      console.error('File upload error:', err);
      attachmentLine = `\n\n**Attachment:** ${file.name} _(upload failed)_`;
    }
  }

  const body = [
    `**Name:** ${name}`,
    email ? `**Email:** ${email}` : '',
    `**Date:** ${new Date().toISOString()}`,
    '',
    '---',
    '',
    message,
    attachmentLine,
  ].filter(l => l !== '').join('\n');

  const issueData = {
    title: `[Contact Form] ${name}`,
    body,
    labels: ['contact-form'],
  };

  try {
    const response = await fetch('https://api.github.com/repos/Unwrenchable/unwrenchable.github.io/issues', {
      method: 'POST',
      headers: { ...GITHUB_HEADERS, 'Authorization': `Bearer ${process.env.GITHUB_PAT}` },
      body: JSON.stringify(issueData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData);
      return res.status(response.status).json({ error: 'Failed to create issue' });
    }

    const issue = await response.json();
    res.status(200).json({ success: true, issueUrl: issue.html_url });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}