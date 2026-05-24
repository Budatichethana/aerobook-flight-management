import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarX2,
  Plane,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import CancelBookingButton from "../../components/CancelBookingButton";
import TicketQr from "../../components/TicketQr";
import { formatDateTime } from "../../lib/formatDateTime";
import {
  createSupabaseServerClient,
  supabaseAdmin,
} from "../../lib/supabase/server";

type BookingRow = {
  id: string;
  pnr_code: string;
  status: string;
  booked_at: string;
  total_price: number | string;
  flights:
    | Array<{
        flight_no: string | null;
        origin: string | null;
        destination: string | null;
        departs_at: string | null;
        arrives_at: string | null;
        aircraft_type: string | null;
      }>
    | {
        flight_no: string | null;
        origin: string | null;
        destination: string | null;
        departs_at: string | null;
        arrives_at: string | null;
        aircraft_type: string | null;
      }
    | null;
  seats:
    | Array<{
        seat_number: string | null;
        class: string | null;
        extra_fee: number | string | null;
      }>
    | {
        seat_number: string | null;
        class: string | null;
        extra_fee: number | string | null;
      }
    | null;
  passengers:
    | Array<{
        full_name: string | null;
        nationality: string | null;
      }>
    | {
        full_name: string | null;
        nationality: string | null;
      }
    | null;
};

export default async function BookingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fbookings");
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, pnr_code, status, booked_at, total_price, flights(flight_no, origin, destination, departs_at, arrives_at, aircraft_type), seats(seat_number, class, extra_fee), passengers(full_name, nationality)",
    )
    .eq("user_id", user.id)
    .order("booked_at", { ascending: false });

  const bookings = (data ?? []) as unknown as BookingRow[];

  const getStatusClasses = (status: string) => {
    if (status === "confirmed") {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    }

    if (status === "rescheduled") {
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    }

    if (status === "cancelled") {
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
    }

    return "bg-brand-50 text-brand-700 ring-1 ring-brand-100";
  };

  return (
    <section className="space-y-6 lg:space-y-8">
      <div className="card flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
            Bookings
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            My Bookings
          </h1>
          <p className="mt-4 text-slate-600">
            Signed in as {user.email ?? "user"}.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-100">
          <Plane className="h-4 w-4 text-brand-600" />
          Manage upcoming and past reservations
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          Could not load your bookings: {error.message}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-12 text-center text-slate-600">
          <div className="rounded-full bg-slate-100 p-3 text-slate-500">
            <CalendarX2 className="h-5 w-5" />
          </div>
          <p className="text-lg font-semibold text-slate-900">
            You have no bookings yet.
          </p>
          <p className="max-w-md text-sm text-slate-500">
            Search for flights and reserve your first trip to start building
            your travel history.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const flight = Array.isArray(booking.flights)
              ? booking.flights[0]
              : booking.flights;
            const seat = Array.isArray(booking.seats)
              ? booking.seats[0]
              : booking.seats;
            const passenger = Array.isArray(booking.passengers)
              ? booking.passengers[0]
              : booking.passengers;
            const totalPrice =
              typeof booking.total_price === "number"
                ? booking.total_price
                : Number(booking.total_price);
            const totalPriceLabel = Number.isFinite(totalPrice)
              ? `$${totalPrice.toFixed(2)}`
              : booking.total_price;
            const isCancelled = booking.status === "cancelled";

            return (
              <article
                key={booking.id}
                className={[
                  "card transition",
                  isCancelled ? "opacity-70 grayscale-[0.15]" : "",
                ].join(" ")}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
                      {booking.pnr_code}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      {flight?.origin ?? "Unknown"} →{" "}
                      {flight?.destination ?? "Unknown"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Booked: {formatDateTime(booking.booked_at)}
                    </p>
                  </div>
                  <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-end lg:justify-start">
                    <span
                      className={[
                        "status-badge",
                        getStatusClasses(booking.status),
                      ].join(" ")}
                    >
                      {booking.status === "confirmed" ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : booking.status === "rescheduled" ? (
                        <RefreshCcw className="h-4 w-4" />
                      ) : booking.status === "cancelled" ? (
                        <ShieldAlert className="h-4 w-4" />
                      ) : (
                        <BadgeCheck className="h-4 w-4" />
                      )}
                      {booking.status}
                    </span>
                    <div className="shrink-0 lg:mt-1">
                      <TicketQr
                        bookingId={booking.id}
                        size={60}
                        compact
                        label="Scan ticket"
                        targetPath="/ticket"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                  <p>Flight: {flight?.flight_no ?? "-"}</p>
                  <p>Seat: {seat?.seat_number ?? "-"}</p>
                  <p>Passenger: {passenger?.full_name ?? "-"}</p>
                  <p>Total: {totalPriceLabel}</p>
                  <p>Aircraft: {flight?.aircraft_type ?? "-"}</p>
                  <p>Nationality: {passenger?.nationality ?? "-"}</p>
                </div>

                {booking.status === "confirmed" ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/bookings/${booking.id}/reschedule`}
                      className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-100"
                    >
                      Reschedule
                    </Link>
                    <CancelBookingButton bookingId={booking.id} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
