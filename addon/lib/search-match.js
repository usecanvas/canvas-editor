export default function searchMatch(content, term) {
  term = (term || '').toLowerCase();
  content = (content || '').toLowerCase();
  return content.includes(term);
}
