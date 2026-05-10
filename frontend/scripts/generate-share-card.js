const fs = require('fs');
const path = require('path');
try {
  const { createCanvas } = require('canvas');
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#08090c';
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';

  ctx.fillStyle = '#dde2ed';
  ctx.font = 'bold 60px monospace';
  ctx.fillText('HANTAVIRUS TRACKER', width / 2, 120);

  ctx.fillStyle = '#e85d3c';
  ctx.font = 'bold 120px sans-serif';
  ctx.fillText('6 CONFIRMED · 3 DEATHS', width / 2, height / 2 + 40);

  ctx.fillStyle = '#3d4558';
  ctx.font = '40px monospace';
  ctx.fillText('hantavirus-tracker.com', width / 2, height - 60);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '../public/share-card.png'), buffer);
  console.log('share-card.png generated successfully.');
} catch (e) {
  console.log('Canvas not installed or failed to generate PNG. ' + e.message);
}
