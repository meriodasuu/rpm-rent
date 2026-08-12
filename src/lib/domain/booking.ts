import { RENTAL_POLICY } from "@/config/rental-policy";
import { calculateRental } from "@/lib/rental";
import type { BookingInput } from "@/lib/validation";
import type { BookingServiceSnapshot, Car, Service } from "@/types/domain";
import { assertRentalPeriod, completedMonthsAt, completedYearsAt } from "./dates";
import { DomainError, validationError } from "./errors";

export type BookingCar = Pick<
  Car,
  "id" | "title" | "published" | "available" | "pricePerDay" | "deposit" | "minimumAge" | "minimumDrivingExperience" | "minimumRentalDays"
>;

export const hasConfiguredBookingPolicy = (car: BookingCar) =>
  car.minimumAge !== null && car.minimumDrivingExperience !== null && car.minimumRentalDays !== null;

export const bookingPolicyProblem = (car: BookingCar) => {
  if (!car.published) return "Автомобиль не опубликован";
  if (!hasConfiguredBookingPolicy(car)) return "Условия аренды автомобиля ещё не настроены";
  if (!car.available) return "Автомобиль недоступен для новых заявок";
  return null;
};

export const evaluateDriverEligibility = ({
  birthDate,
  licenseIssuedOn,
  startDate,
  minimumAge,
  minimumExperienceMonths
}: {
  birthDate: string;
  licenseIssuedOn: string;
  startDate: string;
  minimumAge: number;
  minimumExperienceMonths: number;
}) => {
  const ageAtStart = completedYearsAt(birthDate, startDate);
  if (ageAtStart < 0) throw validationError("Дата рождения должна быть раньше начала аренды", "birthDate");
  if (ageAtStart > RENTAL_POLICY.maximumDriverAge) throw validationError("Проверьте дату рождения", "birthDate");
  const effectiveMinimumAge = Math.max(RENTAL_POLICY.legalAdultAge, minimumAge);
  if (ageAtStart < effectiveMinimumAge) {
    throw new DomainError(
      "DRIVER_NOT_ELIGIBLE",
      `На дату начала аренды водителю должно быть не менее ${effectiveMinimumAge} лет`,
      422,
      { birthDate: [`На дату начала аренды водителю должно быть не менее ${effectiveMinimumAge} лет`] }
    );
  }
  if (licenseIssuedOn < birthDate) throw validationError("Дата выдачи прав не может быть раньше даты рождения", "licenseIssuedOn");
  const experienceMonths = completedMonthsAt(licenseIssuedOn, startDate);
  if (experienceMonths < 0) throw validationError("Дата выдачи прав не может быть позже начала аренды", "licenseIssuedOn");
  if (experienceMonths < minimumExperienceMonths) {
    throw new DomainError(
      "DRIVER_NOT_ELIGIBLE",
      `К началу аренды требуется водительский стаж не менее ${minimumExperienceMonths} мес.`,
      422,
      { licenseIssuedOn: [`К началу аренды требуется водительский стаж не менее ${minimumExperienceMonths} мес.`] }
    );
  }
  return { ageAtStart, experienceMonths, effectiveMinimumAge };
};

export const prepareBooking = (input: BookingInput, car: BookingCar, services: Service[], now = new Date()) => {
  if (!car.published || !car.available) throw new DomainError("CAR_UNAVAILABLE", "Автомобиль недоступен для новых заявок", 409);
  if (!hasConfiguredBookingPolicy(car)) {
    throw new DomainError("POLICY_NOT_CONFIGURED", "Условия аренды автомобиля ещё не настроены. Выберите другую машину или свяжитесь с менеджером.", 409);
  }
  const minimumRentalDays = car.minimumRentalDays;
  const minimumAge = car.minimumAge;
  const minimumExperienceMonths = car.minimumDrivingExperience;
  if (minimumRentalDays === null || minimumAge === null || minimumExperienceMonths === null) {
    throw new DomainError("POLICY_NOT_CONFIGURED", "Условия аренды автомобиля ещё не настроены", 409);
  }
  const rentalDays = assertRentalPeriod({ startDate: input.startAt, endDate: input.endAt, minimumRentalDays, now });
  const eligibility = evaluateDriverEligibility({
    birthDate: input.birthDate,
    licenseIssuedOn: input.licenseIssuedOn,
    startDate: input.startAt,
    minimumAge,
    minimumExperienceMonths
  });
  const selected = services.filter((service) => input.additionalServiceIds.includes(service.id) && service.published);
  if (selected.length !== input.additionalServiceIds.length) {
    throw validationError("Одна или несколько услуг недоступны. Обновите страницу и повторите выбор", "additionalServiceIds");
  }
  const serviceSnapshots: BookingServiceSnapshot[] = selected.map((service) => ({
    id: service.id,
    title: service.title,
    price: service.price ?? 0
  }));
  const calculation = calculateRental({
    startDate: input.startAt,
    endDate: input.endAt,
    pricePerDay: car.pricePerDay,
    deposit: car.deposit,
    servicePrices: serviceSnapshots.map((service) => service.price)
  });
  if (calculation.days !== rentalDays) throw validationError("Не удалось согласовать срок аренды");
  return {
    rentalDays,
    eligibility,
    serviceSnapshots,
    calculation,
    privacyConsentAt: now.toISOString()
  };
};
