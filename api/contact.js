// Vercel API route for contact form submissions
// Deploys to https://your-vercel-app.vercel.app/api/contact
// Set GITHUB_PAT environment variable in Vercel dashboard

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  const body = [
    `**Name:** ${name}`,
    email ? `**Email:** ${email}` : '',
    `**Date:** ${new Date().toISOString()}`,
    '',
    '---',
    '',
    message,
  ].filter(l => l !== '').join('\n');

  const issueData = {
    title: `[Contact Form] ${name}`,
    body,
    labels: ['contact-form'],
  };

  try {
    const response = await fetch('https://api.github.com/repos/Unwrenchable/unwrenchable.github.io/issues', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
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