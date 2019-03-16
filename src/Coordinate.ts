/**
 * A 3 dimensional coordinate
 */
export default interface Coordinate {
  /**
   * The x-coordinate measured in mm. Must be a int32
   */
  x: number,

  /**
   * The y-coordinate measured in mm. Must be a int32
   */
  y: number,

  /**
   * The z-coordinate measured in mm. Must be a int32
   */
  z: number,
}
