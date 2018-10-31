export default function toFixed (number, places = 2) {
  if (typeof number === 'number') {
    return number.toFixed(places);
  }
  return number;
}
