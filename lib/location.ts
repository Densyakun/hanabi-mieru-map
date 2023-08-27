import { Vector3 } from "three"

export function getLat(position: Vector3) {
  return Math.asin((position.y || 0) / position.length()) * 180 / Math.PI
}

export function getLon(position: Vector3) {
  return Math.atan2(position.z || 0, position.x || 0) * -180 / Math.PI
}

export function setLocation(position: Vector3, latitude: number, longitude: number) {
  const a = latitude * Math.PI / 180
  const b = longitude * Math.PI / 180
  const radius = position.length()

  position.set(
    Math.cos(b) * Math.cos(a) * radius,
    Math.sin(a) * radius,
    Math.sin(-b) * Math.cos(a) * radius
  )
}