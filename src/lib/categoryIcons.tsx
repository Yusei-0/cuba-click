import { 
  Smartphone, 
  Laptop, 
  Shirt, 
  Home, 
  Watch, 
  Headphones, 
  Camera, 
  Gamepad, 
  Utensils, 
  Car, 
  Baby, 
  Dumbbell, 
  Briefcase, 
  Book, 
  Gift, 
  Music, 
  Tv, 
  Zap,
  Heart,
  PawPrint,
  Hammer,
  Footprints,
  Wind,
  ShoppingBag
} from 'lucide-react';

export const getCategoryIcon = (categoryName: string) => {
  const normalized = categoryName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("celular") || normalized.includes("movil") || normalized.includes("phone")) return Smartphone;
  if (normalized.includes("computadora") || normalized.includes("laptop") || normalized.includes("pc")) return Laptop;
  if (normalized.includes("ropa") || normalized.includes("moda") || normalized.includes("vestir")) return Shirt;
  if (normalized.includes("hogar") || normalized.includes("casa") || normalized.includes("mueble")) return Home;
  if (normalized.includes("reloj")) return Watch;
  if (normalized.includes("audio") || normalized.includes("audifono") || normalized.includes("sonido")) return Headphones;
  if (normalized.includes("foto") || normalized.includes("camara")) return Camera;
  if (normalized.includes("juego") || normalized.includes("consol") || normalized.includes("gamer")) return Gamepad;
  if (normalized.includes("cocina") || normalized.includes("alimento") || normalized.includes("comida")) return Utensils;
  if (normalized.includes("auto") || normalized.includes("coche") || normalized.includes("moto")) return Car;
  if (normalized.includes("bebe") || normalized.includes("nino") || normalized.includes("infantil")) return Baby;
  if (normalized.includes("deporte") || normalized.includes("gym") || normalized.includes("ejercicio")) return Dumbbell;
  if (normalized.includes("oficina") || normalized.includes("negocio")) return Briefcase;
  if (normalized.includes("libro") || normalized.includes("educacion")) return Book;
  if (normalized.includes("regalo") || normalized.includes("detalle")) return Gift;
  if (normalized.includes("musica")) return Music;
  if (normalized.includes("tv") || normalized.includes("tele") || normalized.includes("video")) return Tv;
  if (normalized.includes("electronica")) return Zap;
  
  if (normalized.includes("belleza") || normalized.includes("salud") || normalized.includes("cuidado")) return Heart;
  if (normalized.includes("mascota") || normalized.includes("perro") || normalized.includes("gato")) return PawPrint;
  if (normalized.includes("herramienta") || normalized.includes("ferreteria")) return Hammer;
  if (normalized.includes("calzado") || normalized.includes("zapato") || normalized.includes("teni")) return Footprints;
  if (normalized.includes("aire") || normalized.includes("clima")) return Wind;
  
  return ShoppingBag; // Default
};
