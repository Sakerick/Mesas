export const TABLE_CAPACITIES = {
  redonda: 10,
  cuadrada: 12,
  rectangular: 14,
  circular_grande: 22,
  serpiente: 24,
};

export const INITIAL_TABLES = [
  // Zona Izquierda (cerca de Barra)
  { id: 24, type: "redonda", x: 125, y: 215 },
  { id: 17, type: "cuadrada", x: 125, y: 285 },
  { id: 16, type: "redonda", x: 125, y: 355 },
  { id: 12, type: "redonda", x: 125, y: 425 },
  { id: 19, type: "cuadrada", x: 125, y: 495 },

  // Serpientes Izquierda
  { id: 28, type: "serpiente", x: 178, y: 285, height: 145 },
  { id: 27, type: "serpiente", x: 178, y: 455, height: 145 },

  // Columna Izquierda-Centro
  { id: 35, type: "redonda", x: 228, y: 155 },
  { id: 34, type: "cuadrada", x: 228, y: 225 },
  { id: 33, type: "redonda", x: 228, y: 290 },
  { id: 32, type: "cuadrada", x: 228, y: 355 },
  { id: 31, type: "redonda", x: 228, y: 420 },
  { id: 30, type: "cuadrada", x: 228, y: 490 },

  // Circulares Grandes Izquierda
  { id: 40, type: "circular_grande", x: 312, y: 225 },
  { id: 39, type: "circular_grande", x: 312, y: 395 },

  // Columna Borde Izquierdo Pista
  { id: 43, type: "redonda", x: 386, y: 140 },
  { id: 42, type: "rectangular", x: 386, y: 205, w: 32, h: 46 },
  { id: 41, type: "serpiente", x: 386, y: 335, height: 155 },

  // Debajo de Pista
  { id: 47, type: "rectangular", x: 448, y: 445, w: 34, h: 52 },
  { id: 48, type: "rectangular", x: 490, y: 445, w: 34, h: 52 },
  { id: 49, type: "rectangular", x: 532, y: 445, w: 34, h: 52 },
  { id: 50, type: "rectangular", x: 574, y: 445, w: 34, h: 52 },

  // Fila Inferior (Rampa / Pasillo)
  { id: 38, type: "cuadrada", x: 328, y: 535 },
  { id: 51, type: "cuadrada", x: 452, y: 542 },
  { id: 52, type: "cuadrada", x: 504, y: 542 },
  { id: 53, type: "cuadrada", x: 554, y: 542 },
  { id: 61, type: "cuadrada", x: 678, y: 535 },
  { id: 66, type: "cuadrada", x: 730, y: 542 },
  { id: 74, type: "cuadrada", x: 786, y: 535 },

  // Borde Derecho Pista
  { id: 59, type: "redonda", x: 638, y: 152 },
  { id: 58, type: "cuadrada", x: 638, y: 218 },
  { id: 55, type: "serpiente", x: 638, y: 350, height: 155 },

  // Circulares Grandes Derecha
  { id: 64, type: "circular_grande", x: 722, y: 215 },
  { id: 63, type: "circular_grande", x: 722, y: 385 },

  // Columna Derecha-Centro
  { id: 65, type: "rectangular", x: 740, y: 88, w: 36, h: 52 },
  { id: 73, type: "redonda", x: 796, y: 102 },
  { id: 72, type: "redonda", x: 796, y: 175 },
  { id: 71, type: "cuadrada", x: 796, y: 245 },
  { id: 69, type: "rectangular", x: 796, y: 325, w: 34, h: 52 },
  { id: 68, type: "redonda", x: 796, y: 405 },
  { id: 62, type: "cuadrada", x: 736, y: 468 },
  { id: 67, type: "cuadrada", x: 796, y: 468 },

  // Serpientes Derecha
  { id: 77, type: "serpiente", x: 848, y: 185, height: 145 },
  { id: 76, type: "serpiente", x: 852, y: 355, height: 145 },
  { id: 75, type: "cuadrada", x: 852, y: 468 },

  // Extremo Derecho
  { id: 78, type: "redonda", x: 848, y: 74 },
  { id: 84, type: "redonda", x: 902, y: 132 },
  { id: 83, type: "cuadrada", x: 902, y: 202 },
  { id: 82, type: "redonda", x: 902, y: 272 },
  { id: 81, type: "cuadrada", x: 902, y: 342 },
  { id: 80, type: "redonda", x: 902, y: 412 },
];
