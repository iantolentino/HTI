import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const crcTable = Uint32Array.from({ length: 256 }, (_, index) => { let value = index; for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1; return value >>> 0; });
const crc32 = (data) => { let value = 0xffffffff; for (const byte of data) value = crcTable[(value ^ byte) & 255] ^ (value >>> 8); return (value ^ 0xffffffff) >>> 0; };
const chunk = (kind, data) => { const type = Buffer.from(kind); const output = Buffer.alloc(12 + data.length); output.writeUInt32BE(data.length, 0); type.copy(output, 4); data.copy(output, 8); output.writeUInt32BE(crc32(Buffer.concat([type, data])), 8 + data.length); return output; };
const inPolygon = (x, y, points) => points.reduce((inside, point, index) => { const next = points[(index + 1) % points.length]; return ((point[1] > y) !== (next[1] > y) && x < (next[0] - point[0]) * (y - point[1]) / (next[1] - point[1]) + point[0]) ? !inside : inside; }, false);
function makePng(size) {
  const pixels = Buffer.alloc(size * size * 4); const scale = size / 180;
  const outer = [[101,32],[51,99],[88,99],[79,148],[129,81],[92,81]];
  const inner = [[101,48],[67,91],[100,91],[91,131],[113,89],[80,89]];
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const px = (x + .5) / scale, py = (y + .5) / scale; let rgb = [245,243,238];
    if (px >= 14 && px <= 166 && py >= 14 && py <= 166) rgb = [255,90,54];
    if (px >= 24 && px <= 156 && py >= 24 && py <= 156) rgb = [255,90,54];
    if (inPolygon(px, py, outer)) rgb = [43,43,43];
    if (inPolygon(px, py, inner)) rgb = [245,243,238];
    const index = (y * size + x) * 4; pixels[index] = rgb[0]; pixels[index + 1] = rgb[1]; pixels[index + 2] = rgb[2]; pixels[index + 3] = 255;
  }
  const scanlines = Buffer.alloc((size * 4 + 1) * size); for (let y = 0; y < size; y += 1) { scanlines[y * (size * 4 + 1)] = 0; pixels.copy(scanlines, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4); }
  const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(scanlines)), chunk('IEND', Buffer.alloc(0))]);
}
const icon32 = makePng(32); const icon180 = makePng(180);
writeFileSync('app/icon.png', icon32); writeFileSync('app/apple-icon.png', icon180);
const icoHeader = Buffer.alloc(22); icoHeader.writeUInt16LE(0, 0); icoHeader.writeUInt16LE(1, 2); icoHeader.writeUInt16LE(1, 4); icoHeader[6] = 32; icoHeader[7] = 32; icoHeader.writeUInt16LE(1, 10); icoHeader.writeUInt16LE(32, 12); icoHeader.writeUInt32LE(icon32.length, 14); icoHeader.writeUInt32LE(22, 18);
writeFileSync('app/favicon.ico', Buffer.concat([icoHeader, icon32]));
