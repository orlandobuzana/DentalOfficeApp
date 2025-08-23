export default function NotFound() {
  // Redirect to home page immediately
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
  
  return null;
}