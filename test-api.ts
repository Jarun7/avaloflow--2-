async function check() {
  try {
    const res = await fetch('http://localhost:3000/api/autodm');
    const data = await res.json();
    console.log('Automations:', data);
  } catch (e) {
    console.error(e);
  }
}
check();
