const { sanitizeHtml } = require('../content/markdownParser');
const input = '<p>Text <script>evil()</script><img src="test.png" onerror="alert(1)" /> ok</p>';
const clean = sanitizeHtml(input);
console.log('Sanitized:', clean);
console.log('Script removed:', !clean.includes('script'));
console.log('onerror removed:', !clean.includes('onerror'));
