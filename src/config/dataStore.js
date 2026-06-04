// Versi ringan dataStore.js untuk deployment Vercel
// Data in-memory hanya digunakan jika database tidak tersedia (fallback minimal)

let inMemoryStudents = [];
let inMemoryWarnings = [];

let useDatabase = false;

const setUseDatabase      = (val)  => { useDatabase = val; };
const isUsingDatabase     = ()     => useDatabase;
const getInMemoryStudents = ()     => inMemoryStudents;
const setInMemoryStudents = (data) => { inMemoryStudents = data; };
const getInMemoryWarnings = ()     => inMemoryWarnings;
const setInMemoryWarnings = (data) => { inMemoryWarnings = data; };

module.exports = {
  setUseDatabase,
  isUsingDatabase,
  getInMemoryStudents,
  setInMemoryStudents,
  getInMemoryWarnings,
  setInMemoryWarnings
};