export interface Destination {
  titulo: string;
  descricao: string;
  foto: string;
  x: number;
  y: number;
}

export interface Route {
  coordinates: [number, number][];
}