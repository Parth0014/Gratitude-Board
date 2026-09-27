import { describe, expect, it } from 'vitest';
import {
  centeredCrop,
  normalizeImageSource,
  parseCanvasDocument,
} from './canvas-document';

describe('canvas image sources', () => {
  it('restores the absolute starter photo URLs saved by Fabric as local paths', () => {
    expect(
      normalizeImageSource('http://localhost:3000/photos/career.jpg'),
    ).toBe('/photos/career.jpg');
    expect(
      parseCanvasDocument({
        version: 1,
        items: [
          {
            id: 'shape:one',
            kind: 'image',
            x: 100,
            y: 75,
            width: 330,
            height: 220,
            angle: 0,
            src: 'http://localhost:3000/photos/career.jpg',
          },
        ],
      })?.items[0]?.src,
    ).toBe('/photos/career.jpg');
  });

  it('does not restore arbitrary remote images', () => {
    expect(normalizeImageSource('https://example.com/private.jpg')).toBeNull();
  });
});

describe('canvas appearance', () => {
  const item = {
    id: 'shape:text',
    kind: 'text',
    x: 10,
    y: 20,
    width: 180,
    height: 80,
    angle: 15,
    text: 'A life I love',
  };

  it('accepts persisted text style and opacity', () => {
    expect(
      parseCanvasDocument({
        version: 1,
        items: [
          {
            ...item,
            opacity: 0.65,
            fontFamily: 'Inter',
            fontSize: 42,
            fill: '#201a1b',
            backgroundColor: '#fff8f0',
          },
        ],
      })?.items[0],
    ).toMatchObject({ opacity: 0.65, fontFamily: 'Inter', fontSize: 42 });
  });

  it('rejects invalid or unsafe appearance values', () => {
    expect(
      parseCanvasDocument({ version: 1, items: [{ ...item, opacity: 1.5 }] }),
    ).toBeNull();
    expect(
      parseCanvasDocument({
        version: 1,
        items: [{ ...item, fill: 'url(javascript:alert(1))' }],
      }),
    ).toBeNull();
  });

  it('accepts a board color but rejects arbitrary CSS', () => {
    expect(
      parseCanvasDocument({
        version: 1,
        background: '#e9f0e4',
        items: [],
      })?.background,
    ).toBe('#e9f0e4');
    expect(
      parseCanvasDocument({
        version: 1,
        background: 'url(javascript:alert(1))',
        items: [],
      }),
    ).toBeNull();
  });
});

describe('image crop', () => {
  it('centers a square crop without modifying the source image', () => {
    const crop = centeredCrop(1200, 800, 1);
    expect(crop.x).toBeCloseTo(1 / 6);
    expect(crop.y).toBe(0);
    expect(crop.width).toBeCloseTo(2 / 3);
    expect(crop.height).toBe(1);
  });

  it('rejects a crop outside the image', () => {
    expect(
      parseCanvasDocument({
        version: 1,
        items: [
          {
            id: 'shape:image',
            kind: 'image',
            x: 0,
            y: 0,
            width: 200,
            height: 200,
            angle: 0,
            src: '/photos/career.jpg',
            crop: { x: 0.8, y: 0, width: 0.4, height: 1 },
          },
        ],
      }),
    ).toBeNull();
  });
});
