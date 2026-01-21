const btn = document.getElementById('btn');
const out = document.getElementById('out');

btn.addEventListener('click', () => {
  const t = new Date().toLocaleString();
  out.textContent = `clicked at ${t}`;
});
