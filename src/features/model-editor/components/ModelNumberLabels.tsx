"use client";

import {
  Html,
  Line,
} from "@react-three/drei";
import { useMemo } from "react";
import {
  Box3,
  Mesh,
  Vector3,
  type Object3D,
} from "three";

import type { PaletteColor } from "@/features/models/types/PaletteColor";

import type { ModelPart } from "../types/ModelPart";

type ModelNumberLabelsProps = {
  model: Object3D;
  parts: ModelPart[];
  palette: PaletteColor[];

  selectedPartId: string | null;
  selectedPartIds: string[];
  highlightedPaletteColorId: string | null;
};

type NumberCallout = {
  partId: string;
  value: string;
  color: string;

  anchorPosition: [
    number,
    number,
    number,
  ];

  elbowPosition: [
    number,
    number,
    number,
  ];

  labelPosition: [
    number,
    number,
    number,
  ];
};

const CALLOUT_OUTWARD_DISTANCE = 0.85;
const CALLOUT_HORIZONTAL_DISTANCE = 0.45;
const CALLOUT_VERTICAL_OFFSET = 0.12;

function formatColorNumber(
  number: number,
): string {
  return `C${String(number).padStart(2, "0")}`;
}

function toTuple(
  vector: Vector3,
): [number, number, number] {
  return [
    vector.x,
    vector.y,
    vector.z,
  ];
}

function shouldShowPartCallout({
  part,
  selectedPartId,
  selectedPartIds,
  highlightedPaletteColorId,
}: {
  part: ModelPart;
  selectedPartId: string | null;
  selectedPartIds: string[];
  highlightedPaletteColorId: string | null;
}): boolean {
  if (selectedPartIds.includes(part.id)) {
    return true;
  }

  if (selectedPartId === part.id) {
    return true;
  }

  return (
    Boolean(highlightedPaletteColorId) &&
    part.paletteColorId === highlightedPaletteColorId
  );
}

function getMeshSurfaceAnchor({
  mesh,
  outwardDirection,
}: {
  mesh: Mesh;
  outwardDirection: Vector3;
}): Vector3 | null {
  const geometry = mesh.geometry;
  const positionAttribute =
    geometry.attributes.position;

  if (!positionAttribute) {
    return null;
  }

  mesh.updateWorldMatrix(true, false);

  const vertex = new Vector3();
  const worldVertex = new Vector3();

  let bestPosition: Vector3 | null = null;
  let bestProjection = Number.NEGATIVE_INFINITY;

  for (
    let index = 0;
    index < positionAttribute.count;
    index += 1
  ) {
    vertex.fromBufferAttribute(
      positionAttribute,
      index,
    );

    worldVertex
      .copy(vertex)
      .applyMatrix4(mesh.matrixWorld);

    const projection =
      worldVertex.dot(outwardDirection);

    if (projection > bestProjection) {
      bestProjection = projection;
      bestPosition = worldVertex.clone();
    }
  }

  return bestPosition;
}

export function ModelNumberLabels({
  model,
  parts,
  palette,
  selectedPartId,
  selectedPartIds,
  highlightedPaletteColorId,
}: ModelNumberLabelsProps) {
  const callouts = useMemo<NumberCallout[]>(() => {
    const paletteById = new Map(
      palette.map((color) => [
        color.id,
        color,
      ]),
    );

    const partsByMeshUuid = new Map(
      parts.map((part) => [
        part.meshUuid,
        part,
      ]),
    );

    model.updateWorldMatrix(true, true);

    const modelBounds = new Box3().setFromObject(
      model,
      true,
    );

    if (modelBounds.isEmpty()) {
      return [];
    }

    const modelCenter = modelBounds.getCenter(
      new Vector3(),
    );

    const nextCallouts: NumberCallout[] = [];

    model.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return;
      }

      const part = partsByMeshUuid.get(
        object.uuid,
      );

      if (
        !part ||
        !part.visible ||
        !part.paletteColorId ||
        !shouldShowPartCallout({
          part,
          selectedPartId,
          selectedPartIds,
          highlightedPaletteColorId,
        })
      ) {
        return;
      }

      const paletteColor = paletteById.get(
        part.paletteColorId,
      );

      if (!paletteColor) {
        return;
      }

      const partBounds = new Box3().setFromObject(
        object,
        true,
      );

      if (partBounds.isEmpty()) {
        return;
      }

      const partCenter = partBounds.getCenter(
        new Vector3(),
      );

      const direction = partCenter
        .clone()
        .sub(modelCenter);

      direction.y = 0;

      if (direction.lengthSq() === 0) {
        direction.set(1, 0, 0);
      }

      direction.normalize();

      object.updateWorldMatrix(true, false);

      const anchorPosition =
        getMeshSurfaceAnchor({
          mesh: object,
          outwardDirection: direction,
        }) ?? partCenter.clone();

      anchorPosition.add(
        direction.clone().multiplyScalar(0.025),
      );

      const elbowPosition = anchorPosition
        .clone()
        .add(
          direction
            .clone()
            .multiplyScalar(
              CALLOUT_OUTWARD_DISTANCE,
            ),
        );

      elbowPosition.y +=
        CALLOUT_VERTICAL_OFFSET;

      const horizontalDirection =
        direction.x >= 0 ? 1 : -1;

      const labelPosition = elbowPosition
        .clone()
        .add(
          new Vector3(
            CALLOUT_HORIZONTAL_DISTANCE *
              horizontalDirection,
            0,
            0,
          ),
        );

      nextCallouts.push({
        partId: part.id,

        value: formatColorNumber(
          paletteColor.number,
        ),

        color: paletteColor.hex,

        anchorPosition: toTuple(
          anchorPosition,
        ),

        elbowPosition: toTuple(
          elbowPosition,
        ),

        labelPosition: toTuple(
          labelPosition,
        ),
      });
    });

    return nextCallouts;
  }, [
    highlightedPaletteColorId,
    model,
    palette,
    parts,
    selectedPartId,
    selectedPartIds,
  ]);

  return (
    <>
      {callouts.map((callout) => (
        <group key={callout.partId}>
          <Line
            points={[
              callout.anchorPosition,
              callout.elbowPosition,
              callout.labelPosition,
            ]}
            color="#d4d4d4"
            lineWidth={1}
            transparent
            opacity={0.65}
            depthTest={false}
          />

          <mesh
            position={
              callout.anchorPosition
            }
          >
            <sphereGeometry args={[0.025, 12, 12]} />

            <meshBasicMaterial
              color={callout.color}
              depthTest={false}
            />
          </mesh>

          <Html
            position={
              callout.labelPosition
            }
            center
            zIndexRange={[20, 0]}
            style={{
              pointerEvents: "none",
            }}
          >
            <div className="select-none whitespace-nowrap rounded-lg border border-white/15 bg-black/85 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-white shadow-xl backdrop-blur-md">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full border border-white/30"
                  style={{
                    backgroundColor:
                      callout.color,
                  }}
                />

                {callout.value}
              </span>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}