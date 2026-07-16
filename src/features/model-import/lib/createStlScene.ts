import { DoubleSide, Group, Mesh, MeshStandardMaterial, type BufferGeometry } from "three";
export const STL_SOURCE_PART_KEY = "stl:0";
export function createStlScene(geometry: BufferGeometry, meshName: string): Group {
  const position = geometry.getAttribute("position");
  if (!position || position.count < 3) throw new Error("Invalid STL geometry.");
  for (let index = 0; index < position.count; index += 1) if (![position.getX(index), position.getY(index), position.getZ(index)].every(Number.isFinite)) throw new Error("Invalid STL vertices.");
  if (!geometry.getAttribute("normal") || geometry.getAttribute("normal").count !== position.count) geometry.computeVertexNormals();
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  if (!geometry.boundingBox || geometry.boundingBox.isEmpty() || !geometry.boundingSphere || !Number.isFinite(geometry.boundingSphere.radius)) throw new Error("Invalid STL bounds.");
  const material = new MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.72, metalness: 0, side: DoubleSide });
  material.name = "STL preview fallback";
  const mesh = new Mesh(geometry, material); mesh.name = meshName; mesh.userData.sourcePartKey = STL_SOURCE_PART_KEY;
  const root = new Group(); root.name = "STL Root"; root.add(mesh); return root;
}
