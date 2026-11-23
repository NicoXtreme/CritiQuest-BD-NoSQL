import type { Game, Review } from '../types'

const images = {
  eclipse: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=900&q=85',
  horizon: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=85',
  realm: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=85',
  nexus: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=85',
  echoes: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=900&q=85',
  ascent: 'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=900&q=85',
}

export const games: Game[] = [
  { id: 'eclipse', mongoId: 'demo_mongo_eclipse', title: 'Eclipse: Reino Perdido', releaseDate: '18 oct 2024', genres: ['RPG', 'Aventura'], platforms: ['PC', 'PlayStation 5', 'Xbox Series'], score: 9.4, reviews: 2847, image: images.eclipse, description: 'Adéntrate en un reino consumido por una noche eterna. Forja alianzas, descubre secretos ancestrales y decide el destino de un mundo al borde del olvido.', ratings: { graficos: 9.7, jugabilidad: 9.3, historia: 9.5, sonido: 9.1 } },
  { id: 'horizon', mongoId: 'demo_mongo_horizon', title: 'Horizonte Cero', releaseDate: '2 sep 2024', genres: ['Acción', 'Ciencia ficción'], platforms: ['PC', 'PlayStation 5'], score: 9.1, reviews: 1926, image: images.horizon, description: 'Una aventura de ciencia ficción vertiginosa a través de mundos desconocidos.', ratings: { graficos: 9.4, jugabilidad: 9.2, historia: 8.9, sonido: 8.9 } },
  { id: 'realm', mongoId: 'demo_mongo_realm', title: 'Reinos del Vacío', releaseDate: '14 jun 2024', genres: ['Estrategia', 'Fantasía'], platforms: ['PC', 'Xbox Series'], score: 8.8, reviews: 1432, image: images.realm, description: 'Construye un imperio donde cada decisión deja huella.', ratings: { graficos: 8.7, jugabilidad: 9.1, historia: 8.8, sonido: 8.6 } },
  { id: 'nexus', mongoId: 'demo_mongo_nexus', title: 'Nexo 2099', releaseDate: '25 abr 2024', genres: ['Acción', 'Cyberpunk'], platforms: ['PC', 'PlayStation 5'], score: 8.7, reviews: 1208, image: images.nexus, description: 'Sobrevive a una metrópolis conectada que nunca duerme.', ratings: { graficos: 9.0, jugabilidad: 8.8, historia: 8.5, sonido: 8.6 } },
  { id: 'echoes', mongoId: 'demo_mongo_echoes', title: 'Ecos del Abismo', releaseDate: '8 mar 2024', genres: ['Terror', 'Supervivencia'], platforms: ['PC', 'Xbox Series'], score: 8.5, reviews: 986, image: images.echoes, description: 'Las profundidades guardan recuerdos que debieron permanecer ocultos.', ratings: { graficos: 8.8, jugabilidad: 8.3, historia: 8.7, sonido: 9.2 } },
  { id: 'ascent', mongoId: 'demo_mongo_ascent', title: 'Ascenso Estelar', releaseDate: '12 ene 2024', genres: ['Carreras', 'Arcade'], platforms: ['PC', 'PlayStation 5', 'Nintendo Switch'], score: 8.3, reviews: 742, image: images.ascent, description: 'Compite por las rutas más peligrosas de la galaxia.', ratings: { graficos: 8.6, jugabilidad: 8.7, historia: 7.4, sonido: 8.5 } },
]

export const reviews: Review[] = [
  { id: 'r1', gameId: 'eclipse', user: 'Lucía_RPG', avatar: 'L', score: 9.5, date: 'Hace 2 horas', comment: 'Un mundo fascinante, lleno de detalles y decisiones que de verdad importan. Hacía años que una historia no me atrapaba así.', ratings: { graficos: 10, jugabilidad: 9, historia: 10, sonido: 9 } },
  { id: 'r2', gameId: 'horizon', user: 'NeoPlayer', avatar: 'N', score: 9.0, date: 'Hace 5 horas', comment: 'Combate preciso y una dirección artística espectacular. Explorar cada rincón siempre tiene recompensa.', ratings: { graficos: 10, jugabilidad: 9, historia: 8, sonido: 9 } },
  { id: 'r3', gameId: 'realm', user: 'ComandanteVega', avatar: 'C', score: 8.8, date: 'Ayer', comment: 'Profundo sin resultar inaccesible. Cada campaña se siente diferente y mantiene la tensión hasta el final.', ratings: { graficos: 8, jugabilidad: 10, historia: 9, sonido: 8 } },
]
