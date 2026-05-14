import { createFileRoute } from "@tanstack/react-router";
import Component2ComparativeMatrixMock from "@/components/Component2ComparativeMatrixMock";

export const Route = createFileRoute("/comparative-matrix-mock")({
  component: Component2ComparativeMatrixMock,
});
