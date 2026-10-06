/**
 * Mock seat maps, shaped like GET /sessions/{id}/seats:
 * sections[] -> rows[] -> seats[], with aisles marked per seat.
 *
 * Hall D is the map drawn in Overlays.pdf. Hall B follows the API's own
 * example (a 10-wide front block and a 14-wide rear one) so the uneven case
 * is exercised too.
 */
const row = (label, count, aisles, marks = {}) => ({ label, count, aisles, marks });

const HALLS = {
  default: [
    {
      name: 'Stalls',
      rows: [
        row('A', 10, [5], { 8: 'held' }),
        row('B', 10, [5], { 6: 'sold', 7: 'sold', 8: 'sold', 9: 'sold' }),
        row('C', 10, [5], { 2: 'held' }),
        row('D', 10, [5], { 2: 'sold', 3: 'sold', 6: 'held', 7: 'held' }),
      ],
    },
  ],
  B: [
    {
      name: 'Front stalls',
      rows: [row('A', 10, [5], { 1: 'sold', 2: 'sold', 3: 'sold' }), row('B', 10, [5]), row('C', 10, [5], { 9: 'sold' })],
    },
    {
      name: 'Rear stalls',
      rows: [row('D', 14, [4, 10]), row('E', 14, [4, 10], { 7: 'held', 8: 'held' }), row('F', 14, [4, 10]), row('G', 14, [4, 10], { 1: 'unavailable', 14: 'unavailable' })],
    },
  ],
};

export function buildSeatMap(session, soldCodes = [], mineCodes = []) {
  const layout = HALLS[session.hall.name] ?? HALLS.default;
  let rowIndex = 0;
  return {
    sessionId: session.id,
    hall: session.hall,
    sections: layout.map((section) => ({
      name: section.name,
      rows: section.rows.map((r) => {
        rowIndex += 1;
        return {
          label: r.label,
          seats: Array.from({ length: r.count }, (_, i) => {
            const number = i + 1;
            const code = `${r.label}${number}`;
            const isMine = mineCodes.includes(code);
            const state = soldCodes.includes(code) ? 'sold' : isMine ? 'held' : (r.marks[number] ?? 'available');
            return { id: rowIndex * 100 + number, code, label: String(number), state, aisleAfter: r.aisles.includes(number), isMine };
          }),
        };
      }),
    })),
  };
}
