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
        size: { height: 20, width: 20 },
      },
      {
        fill: "orange",
        stroke: "white",
        strokeSize: 10,
        size: { height: 50, width: 50 },
        delay: 70,
      },
    ],
  },
};

export const HoverDemo: Story = {
  render: (args) => (
    <div style={{ padding: 32 }}>
      <ReactiveCursor {...args} hoverScale={1.25} hoverSmoothing={0.18} />
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
    layers: [
      // small center dot
      {
        SVG: "circle",
        fill: "#000",
        stroke: "white",
        strokeSize: 1,
        size: { width: 8, height: 8 },
      },
      // thin ring
      {
        SVG: "circle",
        fill: "transparent",
        stroke: "white",
        strokeSize: 2,
        size: { width: 16, height: 16 },
        delay: 40,
      },
    ],
  },
};
