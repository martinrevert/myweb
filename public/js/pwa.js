document.addEventListener('DOMContentLoaded', init, false);
function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then((reg) => {
        console.log('Service worker registered -->', reg);
      }, (err) => {
        console.error('Service worker not registered -->', err);
      });
  }
}

async function getInstalledApps() {
  const installedApps = await navigator.getInstalledRelatedApps();
  const giraStatus = document.getElementById('relatedStatus');
  giraStatus.textContent = `resolved (${installedApps.length})`;
  const giraResults = document.getElementById('relatedResults');
  giraResults.textContent = JSON.stringify(installedApps, null, 2);
}

if ('getInstalledRelatedApps' in navigator) {
  getInstalledApps();
} else {
  const giraStatus = document.getElementById('giraStatus');
  giraStatus.textContent = `not supported`;
}