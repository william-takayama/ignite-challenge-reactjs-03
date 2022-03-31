export interface SpacingProps {
  direction?: 'vertical' | 'horizontal';
  size?: number;
}

export default function Spacing({
  direction = 'vertical',
  size = 8,
}: SpacingProps): JSX.Element {
  return (
    <div
      style={{
        width: direction === 'vertical' ? 0 : size,
        height: direction === 'vertical' ? size : 0,
      }}
    />
  );
}
