export default function searchMatch(term, content) {
  term = (term || '').toLowerCase();
  content = (content || '').toLowerCase();
  return content.includes(term);
}
