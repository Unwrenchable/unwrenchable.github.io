// Vercel API route for contact form submissions
// Deploys to https://your-vercel-app.vercel.app/api/contact
// Set GITHUB_PAT environment variable in Vercel dashboard

// Ratio of Unicode replacement characters above which a decoded string is
// considered binary rather than valid text content.
const BINARY_DETECTION_THRESHOLD = 0.05;

const GITHUB_HEADERS = {
  'Accept': 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
};

async function uploadGist(fileName, fileContent, pat) {
  const gistRes = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: { ...GITHUB_HEADERS, 'Authorization': `Bearer ${pat}` },
    body: JSON.stringify({
      description: `Contact form attachment: ${fileName}`,
      public: false,
      files: { [fileName]: { content: fileContent } },
    }),
  });
  if (!gistRes.ok) return null;
  const gist = await gistRes.json();
  return gist.html_url || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message, file } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  // Handle optional file attachment — upload as a secret Gist
  let attachmentLine = '';
  if (file && file.name && file.data) {
    try {
      // Decode base64 to text; for binary files store a note about the filename
      let fileContent;
      try {
        fileContent = Buffer.from(file.data, 'base64').toString('utf8');
        // Basic check: if result contains many replacement chars it's likely binary
        if (fileContent.length > 0) {
          const nullRatio = (fileContent.match(/\uFFFD/g) || []).length / fileContent.length;
          if (nullRatio > BINARY_DETECTION_THRESHOLD) {
            fileContent = `[Binary file — ${file.name} (${file.type || 'unknown type'})]`;
          }
        }
      } catch {
        fileContent = `[Could not decode file — ${file.name}]`;
      }

      const gistUrl = await uploadGist(file.name, fileContent, process.env.GITHUB_PAT);
      attachmentLine = gistUrl
        ? `\n\n**Attachment:** [${file.name}](${gistUrl})`
        : `\n\n**Attachment:** ${file.name} _(upload failed)_`;
    } catch (err) {
      console.error('Gist upload error:', err);
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