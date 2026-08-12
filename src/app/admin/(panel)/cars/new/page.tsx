import { CarForm } from "@/components/admin/car-form";
import type { Car } from "@/types/domain";

export const metadata = { title: "Новый автомобиль" };

export default function NewCarPage() {
  const car: Car = { id: crypto.randomUUID(), slug: "new-car", brand: "", model: "", title: "Новый автомобиль", category: "Премиум", bodyType: "Седан", vehicleClass: "Премиум", year: null, transmission: null, engine: null, horsepower: null, driveType: null, seats: null, shortDescription: "Добавьте подтверждённое краткое описание автомобиля.", description: "Добавьте подтверждённое описание, характеристики и условия аренды перед публикацией автомобиля.", pricePerDay: 0, oldPrice: null, deposit: 0, minimumAge: null, minimumDrivingExperience: null, minimumRentalDays: null, mileageLimit: null, extraMileagePrice: null, insurance: null, features: [], rentalConditions: [], available: false, published: false, isNew: true, isPromotion: false, isDemo: true, recommendedOrder: 99, images: [], seoTitle: null, seoDescription: null };
  return <div className="admin-page"><div className="container"><p className="eyebrow">Каталог</p><h1 className="admin-title">Новый автомобиль</h1><CarForm car={car} /></div></div>;
}
