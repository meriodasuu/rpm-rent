import { saveCarAction } from "@/app/admin/actions";
import { RENTAL_POLICY } from "@/config/rental-policy";
import type { Car } from "@/types/domain";

const TextField = ({ name, label, value, type = "text", min, max, required = false }: { name: string; label: string; value: string | number | null; type?: string; min?: number; max?: number; required?: boolean }) => (
  <div className="field"><label htmlFor={name}>{label}</label><input className="input" id={name} name={name} type={type} min={min} max={max} defaultValue={value ?? ""} required={required} /></div>
);

const TextArea = ({ name, label, value, placeholder, required = false }: { name: string; label: string; value: string; placeholder?: string; required?: boolean }) => (
  <div className="field full"><label htmlFor={name}>{label}</label><textarea className="textarea" id={name} name={name} defaultValue={value} placeholder={placeholder} required={required} /></div>
);

export function CarForm({ car }: { car: Car }) {
  const policyIncomplete = car.minimumAge === null || car.minimumDrivingExperience === null || car.minimumRentalDays === null;
  return (
    <form className="surface admin-form" action={saveCarAction}>
      <input type="hidden" name="id" value={car.id} />
      <div className="stack">
        <h2>Основное</h2>
        <div className="form-grid">
          <TextField name="title" label="Название" value={car.title} required />
          <TextField name="slug" label="Slug" value={car.slug} required />
          <TextField name="brand" label="Марка" value={car.brand} required />
          <TextField name="model" label="Модель" value={car.model} required />
          <TextField name="category" label="Категория" value={car.category} required />
          <TextField name="bodyType" label="Кузов" value={car.bodyType} required />
          <TextField name="vehicleClass" label="Класс" value={car.vehicleClass} required />
          <TextField name="recommendedOrder" label="Порядок в каталоге" value={car.recommendedOrder} type="number" min={0} max={100000} required />
        </div>
        <TextArea name="shortDescription" label="Краткое описание" value={car.shortDescription} required />
        <TextArea name="description" label="Полное описание" value={car.description} required />

        <h2>Цена и обязательные правила заявки</h2>
        {policyIncomplete ? <p className="field-error">Онлайн-заявка для этой машины заблокирована, пока не заданы возраст, стаж и минимальный срок. Не подставляйте приблизительные значения.</p> : null}
        <div className="form-grid">
          <TextField name="pricePerDay" label="Цена за сутки, ₽" value={car.pricePerDay} type="number" min={0} max={RENTAL_POLICY.maximumDailyPrice} required />
          <TextField name="oldPrice" label="Старая цена (при наличии), ₽" value={car.oldPrice} type="number" min={0} max={RENTAL_POLICY.maximumMoneyAmount} />
          <TextField name="deposit" label="Залог, ₽" value={car.deposit} type="number" min={0} max={RENTAL_POLICY.maximumMoneyAmount} required />
          <TextField name="minimumAge" label="Минимальный возраст" value={car.minimumAge} type="number" min={RENTAL_POLICY.legalAdultAge} max={RENTAL_POLICY.maximumDriverAge} />
          <TextField name="minimumDrivingExperience" label="Минимальный стаж, месяцев" value={car.minimumDrivingExperience} type="number" min={0} max={1200} />
          <TextField name="minimumRentalDays" label="Минимальный срок, суток" value={car.minimumRentalDays} type="number" min={1} max={RENTAL_POLICY.maximumRentalDays} />
          <TextField name="mileageLimit" label="Лимит пробега, км/сутки" value={car.mileageLimit} type="number" min={0} max={100000} />
          <TextField name="extraMileagePrice" label="Перепробег, ₽/км" value={car.extraMileagePrice} type="number" min={0} max={RENTAL_POLICY.maximumMoneyAmount} />
          <TextField name="insurance" label="Страхование" value={car.insurance} />
        </div>
        <TextArea name="rentalConditions" label="Условия аренды: по одному пункту на строку" value={car.rentalConditions.join("\n")} />

        <h2>Характеристики</h2>
        <div className="form-grid">
          <TextField name="year" label="Год" value={car.year} type="number" min={1900} max={2200} />
          <TextField name="engine" label="Двигатель" value={car.engine} />
          <TextField name="horsepower" label="Мощность, л.с." value={car.horsepower} type="number" min={1} max={10000} />
          <TextField name="transmission" label="Трансмиссия" value={car.transmission} />
          <TextField name="driveType" label="Привод" value={car.driveType} />
          <TextField name="seats" label="Количество мест" value={car.seats} type="number" min={1} max={100} />
        </div>
        <TextArea name="features" label="Особенности: по одному пункту на строку" value={car.features.join("\n")} />

        <h2>Фотографии и SEO</h2>
        <TextArea name="images" label="Пути к фотографиям: по одному на строку" value={car.images.map((image) => image.url).join("\n")} placeholder="/images/cars/model/01.jpg" />
        <div className="form-grid"><TextField name="seoTitle" label="SEO title" value={car.seoTitle} /><TextField name="seoDescription" label="SEO description" value={car.seoDescription} /></div>
        <div className="grid-3">
          <label className="checkbox"><input type="checkbox" name="available" defaultChecked={car.available} />Доступен для новых заявок</label>
          <label className="checkbox"><input type="checkbox" name="published" defaultChecked={car.published} />Опубликован</label>
          <label className="checkbox"><input type="checkbox" name="isNew" defaultChecked={car.isNew} />Новинка</label>
          <label className="checkbox"><input type="checkbox" name="isPromotion" defaultChecked={car.isPromotion} />Спецусловие</label>
          <label className="checkbox"><input type="checkbox" name="isDemo" defaultChecked={car.isDemo} />Неподтверждённые данные</label>
        </div>
        <p className="muted small">Опубликованный и доступный автомобиль нельзя сохранить без точных возрастных требований, стажа и минимального срока.</p>
        <div><button className="button red" type="submit">Сохранить автомобиль</button></div>
      </div>
    </form>
  );
}
