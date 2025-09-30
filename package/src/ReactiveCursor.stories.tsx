import type { Meta, StoryObj } from '@storybook/react';
import { ReactiveCursor } from './component';
import type { ReactiveCursorProps } from './types';

const meta: Meta<typeof ReactiveCursor> = {
  title: 'Components/ReactiveCursor',
  component: ReactiveCursor,
};
export default meta;

type Story = StoryObj<typeof ReactiveCursor>;

// If you keep a hand-rolled template function:
const Template = (props: ReactiveCursorProps) => <ReactiveCursor {...props} />;
// or:
const TypedTemplate = (props: React.ComponentProps<typeof ReactiveCursor>) => (
  <ReactiveCursor {...props} />
);

export const Basic: Story = {
  args: {
    enabled: true,
    hoverEffect: 'scale',
    layers: ['base', 'ring'],
  },
};
