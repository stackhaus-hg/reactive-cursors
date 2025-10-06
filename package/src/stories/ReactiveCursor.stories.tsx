// Story for Stackhaus' ReactiveCursor component (in /component/index.tsx)

import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ReactiveCursor from "../component/index";

const meta = {
  title: "Component/ReactiveCursor",
  component: ReactiveCursor,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {},
  args: {
    enable: true,
    showSystemCursor: true,
    mixBlendMode: "normal",
    zIndex: 2147483647,
  },
} satisfies Meta<typeof ReactiveCursor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Arrow: Story = {
  args: {
    mixBlendMode: "difference",
    layers: [
      {
        fill: "black",
        stroke: "white",
        strokeSize: 10,
        size: { width: 20, height: 20 },
      },
      {
        fill: "orange",
        stroke: "white",
        strokeSize: 10,
        size: { width: 50, height: 50 },
        delay: 70,
      },
    ],
  },
};

/**
 * Demo of the new global hover effect.
 * Small center dot + thin ring so it looks like a pointer, not a big blob.
 * Scope stays minimal (Marco's feedback): only uses the new props, no arch changes.
 */
export const HoverDemo: Story = {
  render: (args) => (
    <div style={{ padding: 32 }}>
      {/* modest scaling so it doesn’t blow up */}
      <ReactiveCursor {...args} hoverScale={1.2} />
      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
        <button style={{ cursor: "pointer", padding: "12px 16px" }}>
          Hover me (button)
        </button>
        <a href="#" style={{ cursor: "pointer", textDecoration: "underline" }}>
          or me (link)
        </a>
        <span style={{ cursor: "default", padding: "12px 16px" }}>
          and this should be normal (default)
        </span>
      </div>
    </div>
  ),
  args: {
    enable: true,
    showSystemCursor: true,
    mixBlendMode: "normal",
    layers: [
      // small center dot
      {
        SVG: "circle",
        fill: "black",
        stroke: "white",
        strokeSize: 1,
        size: { width: 6, height: 6 },
      },
      // thin trailing ring
      {
        SVG: "circle",
        fill: "transparent",
        stroke: "white",
        strokeSize: 1,
        size: { width: 14, height: 14 },
        delay: 60,
      },
    ],
  },
};
