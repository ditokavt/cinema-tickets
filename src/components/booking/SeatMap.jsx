import { Fragment } from 'react';
import Seat from './Seat.jsx';
import SeatLegend from './SeatLegend.jsx';

const GAP = 8; // between seats
const AISLE = 24; // extra space where a gangway runs
const LABEL = 22.5; // row letter column
const MAX_SEAT = 52; // the designed size
const MIN_SEAT = 36; // below this the map scrolls sideways instead of shrinking

const aislesIn = (row) => row.seats.filter((s, i) => s.aisleAfter && i < row.seats.length - 1).length;

/**
 * The hall, drawn from GET /sessions/{id}/seats: sections -> rows -> seats.
 * Nothing about the shape is assumed. Each section keeps its own width and
 * heading, row letters come from the data, aisles are the per-seat `aisleAfter`
 * flags and `unavailable` seats leave a gap. Rows shorter than the widest one
 * are centred, each with its letter beside its first seat. Seats are 52px and
 * scale down (never below 36px) only when a wider hall would not fit.
 */
export default function SeatMap({ map, selectedIds, onToggle }) {
  const rows = map.sections.flatMap((section) => section.rows);
  const widest = rows.reduce((best, row) => {
    const fixed = (row.seats.length - 1) * GAP + aislesIn(row) * AISLE;
    return !best || row.seats.length * MAX_SEAT + fixed > best.seats * MAX_SEAT + best.fixed ? { seats: row.seats.length, fixed } : best;
  }, null) ?? { seats: 1, fixed: 0 };

  const seatSize = `clamp(${MIN_SEAT}px, calc((100cqw - ${LABEL + widest.fixed + 6}px) / ${widest.seats}), ${MAX_SEAT}px)`;

  return (
    <div>
      <div className="mx-5 flex h-[30px] items-center justify-center rounded-b-[16px] rounded-t-[2px] bg-raised">
        <span className="t-label-s uppercase text-white">Screen</span>
      </div>

      <div className="no-scrollbar mt-8 overflow-x-auto [container-type:inline-size]">
        <div className="mx-auto flex w-max flex-col gap-7 pl-[2px]" style={{ '--seat': seatSize }}>
          {map.sections.map((section) => {
            const first = section.rows[0]?.label;
            const last = section.rows[section.rows.length - 1]?.label;
            return (
              <section key={section.name} aria-label={section.name} className="mx-auto w-max">
                <h4 className="t-label-s whitespace-pre uppercase text-secondary">
                  {section.name} ·  Rows {first === last ? first : `${first}-${last}`}
                </h4>
                <div className="mt-[23px] flex flex-col items-center gap-[10px] pl-[3.5px]">
                  {section.rows.map((row) => {
                    // A row that starts with gaps keeps its letter beside the first real seat.
                    const lead = row.seats.findIndex((seat) => seat.state !== 'unavailable');
                    const leading = row.seats.slice(0, Math.max(lead, 0));
                    const rest = row.seats.slice(Math.max(lead, 0));
                    const cell = (seat, i, list) => {
                      const status = selectedIds.includes(seat.id) ? 'selected' : seat.isMine ? 'available' : seat.state;
                      return (
                        <Fragment key={seat.id}>
                          <Seat seat={seat} status={status} onToggle={onToggle} />
                          {seat.aisleAfter && i < list.length - 1 && <span aria-hidden="true" className="w-4 shrink-0" />}
                        </Fragment>
                      );
                    };
                    return (
                      <div key={row.label} className="flex items-center">
                        {leading.length > 0 && <div className="mr-2 flex gap-2">{leading.map((seat, i) => cell(seat, i, row.seats))}</div>}
                        <span className="t-label-s w-[22.5px] shrink-0 text-white" aria-hidden="true">
                          {row.label}
                        </span>
                        <div className="flex gap-2">{rest.map((seat, i) => cell(seat, i + leading.length, row.seats))}</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <SeatLegend className="mt-8" />
    </div>
  );
}
