import type { Booking, BookingStatus, Car, Faq, Service } from "@/types/domain";
import type { BookingInput } from "@/lib/validation";

export interface DataStore {
  getCars(options?: { includeHidden?: boolean }): Promise<Car[]>;
  getCarBySlug(slug: string, options?: { includeHidden?: boolean }): Promise<Car | null>;
  getCarById(id: string): Promise<Car | null>;
  saveCar(car: Car): Promise<Car>;
  deleteCar(id: string): Promise<void>;
  getServices(options?: { includeHidden?: boolean }): Promise<Service[]>;
  saveService(service: Service): Promise<Service>;
  deleteService(id: string): Promise<void>;
  getFaqs(options?: { includeHidden?: boolean }): Promise<Faq[]>;
  saveFaq(faq: Faq): Promise<Faq>;
  deleteFaq(id: string): Promise<void>;
  createBooking(input: BookingInput): Promise<Booking>;
  isCarAvailable(carId: string, startDate: string, endDate: string): Promise<boolean>;
  getBookings(): Promise<Booking[]>;
  updateBookingStatus(id: string, status: BookingStatus): Promise<void>;
}
