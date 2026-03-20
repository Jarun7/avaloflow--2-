async function check() {
  try {
    const res = await fetch('http://localhost:3000/api/audiences');
    const data = await res.json();
    console.log('First audience tags:', data[0]?.tags, typeof data[0]?.tags, Array.isArray(data[0]?.tags));
  } catch (e) {
    console.error(e);
  }
}
check();
